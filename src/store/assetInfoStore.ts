import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import {
  Asset,
  Chain,
  ChainAsset,
  EVMChains,
  isBitcoin,
  isEVM,
  isEvmNativeToken,
  isSolana,
  isStarknet,
  isSui,
} from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import { BitcoinProvider } from "@gardenfi/core";
import { RouteValidator } from "../utils/routeValidator";
import { generateTokenKey } from "../utils/generateTokenKey";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getBalanceMulticall } from "../utils/getBalanceMulticall";
import { IInjectedBitcoinProvider } from "@gardenfi/wallet-connectors";
import { getOrderPair } from "../utils/utils";
import {
  getSolanaTokenBalance,
  getStarknetTokenBalance,
  getSuiTokenBalance,
} from "../utils/getTokenBalance";
import { Hex } from "viem";
import { getSpendableBalance } from "../utils/getmaxBtc";
import logger from "../utils/logger";
import { getLegacyGasEstimate } from "../utils/getNativeTokenFee";
import { SupportedChains } from "../layout/wagmi/config";
import { getAllWorkingRPCs } from "../utils/rpcUtils";
import { Network } from "@gardenfi/utils";

// New API Response Types
export type ApiAsset = {
  id: string;
  name: string;
  chain: string;
  icon: string;
  htlc: {
    address: string;
    schema: string;
  } | null;
  token: {
    address: string;
    schema: string | null;
  } | null;
  decimals: number;
  min_amount: string;
  max_amount: string;
  price: number;
};

export type ApiChainData = {
  chain: string;
  id: string;
  icon: string;
  explorer_url: string;
  confirmation_target: number;
  source_timelock: string;
  destination_timelock: string;
  supported_htlc_schemas: string[];
  supported_token_schemas: string[];
  assets: ApiAsset[];
};

export type ApiChainsResponse = {
  status: string;
  result: ApiChainData[];
};

// Internal Types
export type ChainData = {
  chainId: number;
  explorer: string;
  networkLogo: string;
  name: string;
  identifier: Chain;
  confirmationTarget: number;
  sourceTimelock: string;
  destinationTimelock: string;
  supportedHtlcSchemas: string[];
  supportedTokenSchemas: string[];
};

export type AssetConfig = Asset & {
  asset: string;
  chainData?: ChainData;
  price?: number;
  minAmount?: string;
  maxAmount?: string;
};

export type FiatData = {
  chain: Chain;
  htlc_address: string;
  token_price: number;
};

export type FiatResponse = {
  status: string;
  result: FiatData[];
};

export type Assets = Record<string, AssetConfig>;
export type Chains = Partial<Record<Chain, ChainData>>;

function parseChainIdentifier(chainName: string): Chain | null {
  return SUPPORTED_CHAINS.includes(chainName as Chain)
    ? (chainName as Chain)
    : null;
}

function parseChainId(idString: string): number {
  const parts = idString.split(":");
  if (parts.length > 1) {
    const parsed = parseInt(parts[1], 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  // For non-numeric chains like bitcoin, sui, return 0
  return 0;
}

function formatChainName(chainName: string): string {
  return chainName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type AssetInfoState = {
  allChains: Chains | null;
  allAssets: Assets | null;
  assets: Assets | null;
  chains: Chains | null;
  routeValidator: RouteValidator | null;
  fiatData: Record<string, number | undefined>;
  balances: Record<string, BigNumber | undefined>;
  workingRPCs: Record<number, string[]>;
  isLoading: boolean;
  isAssetSelectorOpen: {
    isOpen: boolean;
    type: IOType;
  };
  error: string | null;
  setOpenAssetSelector: (type: IOType) => void;
  CloseAssetSelector: () => void;
  fetchAndSetRPCs: () => Promise<void>;
  fetchAndSetAssetsAndChains: () => Promise<void>;
  fetchAndSetFiatValues: () => Promise<void>;
  fetchAndSetEvmBalances: (
    address: string,
    fetchOnlyAsset?: AssetConfig
  ) => Promise<void>;
  fetchAndSetBitcoinBalance: (
    provider: IInjectedBitcoinProvider,
    address: string
  ) => Promise<void>;
  fetchAndSetStarknetBalance: (address: string) => Promise<void>;
  fetchAndSetSolanaBalance: (address: PublicKey) => Promise<void>;
  fetchAndSetSuiBalance: (address: string) => Promise<void>;
  clearBalances: () => void;
  isRouteValid: (from: AssetConfig, to: AssetConfig) => boolean;
  getValidDestinations: (fromAsset: AssetConfig) => AssetConfig[];
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  allAssets: null,
  allChains: null,
  routeValidator: null,
  fiatData: {},
  balances: {},
  workingRPCs: {},
  isAssetSelectorOpen: {
    isOpen: false,
    type: IOType.input,
  },
  isLoading: false,
  error: null,
  fetchAndSetRPCs: async () => {
    set({ isLoading: true });
    const workingRPCs = await getAllWorkingRPCs([...SupportedChains]);
    set({ workingRPCs, isLoading: false });
  },
  setOpenAssetSelector: (type) =>
    set({
      isAssetSelectorOpen: {
        isOpen: true,
        type,
      },
    }),

  CloseAssetSelector: () =>
    set({
      isAssetSelectorOpen: {
        type: get().isAssetSelectorOpen.type,
        isOpen: false,
      },
    }),

  fetchAndSetAssetsAndChains: async () => {
    try {
      set({ isLoading: true });
      // Initialize and load the route policy once
      const validator = new RouteValidator(
        import.meta.env.VITE_BASE_URL,
        import.meta.env.VITE_API_KEY
      );
      await validator.loadPolicy();
      set({ routeValidator: validator });
      const res = await axios.get<ApiChainsResponse>(
        API().data.assets(network).toString()
      );

      if (res.data.status !== "Ok") {
        throw new Error("Failed to fetch chains data");
      }

      const allChains: Chains = {};
      const allAssets: Assets = {};
      const assets: Assets = {};
      const chains: Chains = {};

      for (const apiChain of res.data.result) {
        const chainIdentifier = parseChainIdentifier(apiChain.chain);

        if (!chainIdentifier || !SUPPORTED_CHAINS.includes(chainIdentifier)) {
          continue;
        }

        // Parse chain ID from the "id" field (e.g., "evm:84532" -> 84532, "solana:103" -> 103)
        const chainId = parseChainId(apiChain.id);

        const chainData: ChainData = {
          chainId,
          explorer: apiChain.explorer_url,
          networkLogo: apiChain.icon,
          name: formatChainName(apiChain.chain),
          identifier: chainIdentifier,
          confirmationTarget: apiChain.confirmation_target,
          sourceTimelock: apiChain.source_timelock,
          destinationTimelock: apiChain.destination_timelock,
          supportedHtlcSchemas: apiChain.supported_htlc_schemas,
          supportedTokenSchemas: apiChain.supported_token_schemas,
        };

        allChains[chainIdentifier] = chainData;
        let totalAssets = 0;

        for (const apiAsset of apiChain.assets) {
          const atomicSwapAddress = apiAsset.htlc?.address || "";
          const tokenAddress = apiAsset.token?.address || atomicSwapAddress;

          const tokenKey = generateTokenKey(chainIdentifier, tokenAddress);

          const assetSymbol =
            apiAsset.id.split(":")[1]?.toUpperCase() || "UNKNOWN";

          const assetConfig: AssetConfig = {
            asset: apiAsset.id,
            chain: chainIdentifier,
            atomicSwapAddress,
            tokenAddress,
            decimals: apiAsset.decimals,
            name: apiAsset.name,
            symbol: assetSymbol,
            logo: apiAsset.icon,
            price: apiAsset.price,
            chainData, // Include chain data in each asset
            minAmount: apiAsset.min_amount,
            maxAmount: apiAsset.max_amount,
          };

          allAssets[tokenKey] = assetConfig;
          assets[tokenKey] = assetConfig;
          totalAssets++;
        }

        if (totalAssets > 0) {
          chains[chainIdentifier] = chainData;
        }
      }

      set({ allAssets, allChains, assets, chains });
    } catch (error) {
      logger.error("failed to fetch assets data ❌", error);
      set({ error: "Failed to fetch assets data" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAndSetFiatValues: async () => {
    try {
      const { data } = await axios.get<FiatResponse>(
        API().quote.fiatValues.toString()
      );

      const fiatData = data.result.reduce(
        (acc, { chain, htlc_address, token_price }) => {
          acc[`${chain}_${htlc_address.toLowerCase()}`] = token_price;
          return acc;
        },
        {} as Record<string, number>
      );

      set({ fiatData });
    } catch {
      /*empty*/
    }
  },

  fetchAndSetEvmBalances: async (
    address: string,
    fetchOnlyAsset?: AssetConfig
  ) => {
    const { assets, workingRPCs } = get();
    if (!assets) return;

    let tokensByChain: Partial<Record<Chain, AssetConfig[]>> = {};
    const targetAssets = fetchOnlyAsset
      ? [fetchOnlyAsset]
      : Object.values(assets);

    for (const asset of targetAssets) {
      if (!isEVM(asset.chain)) continue;
      if (!tokensByChain[asset.chain]) tokensByChain[asset.chain] = [];
      tokensByChain[asset.chain]!.push(asset);
    }

    try {
      const balanceResults = await Promise.allSettled(
        Object.entries(tokensByChain).map(async ([chain, assets]) => {
          const chainBalances = await getBalanceMulticall(
            assets.map((asset) => asset.tokenAddress) as Hex[],
            address as Hex,
            chain as EVMChains,
            workingRPCs
          );

          const updatedBalances: Record<string, BigNumber | undefined> = {};

          for (const asset of assets!) {
            const orderKey = getOrderPair(chain, asset.tokenAddress);
            let balance = chainBalances[asset.tokenAddress];

            if (
              balance &&
              balance.gt(0) &&
              isEvmNativeToken(chain as EVMChains, asset.tokenAddress)
            ) {
              const fee = await getLegacyGasEstimate(
                chain as EVMChains,
                address as `0x${string}`,
                asset.atomicSwapAddress as `0x${string}`
              );

              if (fee) {
                const feeBN = new BigNumber(fee.gasCost);
                balance = BigNumber.max(balance.minus(feeBN), 0);
              }
            }

            updatedBalances[orderKey] = balance;
          }

          return updatedBalances;
        })
      );

      const finalBalances = balanceResults.reduce((acc, result) => {
        return result.status === "fulfilled"
          ? { ...acc, ...result.value }
          : acc;
      }, {});

      set({ balances: { ...get().balances, ...finalBalances } });
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  },

  fetchAndSetBitcoinBalance: async (
    provider: IInjectedBitcoinProvider,
    address: string
  ) => {
    const { assets } = get();
    if (!assets || !provider) return;

    try {
      const balance = await provider.getBalance();
      if (!balance?.val?.total) return;

      const formattedBalance = new BigNumber(balance.val.confirmed);

      const _provider = new BitcoinProvider(
        network === "mainnet" ? Network.MAINNET : Network.TESTNET
      );

      const feeRate = await _provider.getFeeRates();
      const utxos = await _provider.getUTXOs(address, Number(formattedBalance));
      const spendable = await getSpendableBalance(
        address,
        Number(formattedBalance),
        utxos.length,
        feeRate.fastestFee
      );
      const maxSpendableBalance = spendable.ok ? spendable.val : 0;

      const btcBalance = Object.values(assets)
        .filter((asset) => isBitcoin(asset.chain))
        .reduce(
          (acc, asset) => {
            acc[getOrderPair(asset.chain, asset.tokenAddress)] = new BigNumber(
              maxSpendableBalance
            );
            return acc;
          },
          {} as Record<string, BigNumber | undefined>
        );

      set({ balances: { ...get().balances, ...btcBalance } });
    } catch {
      /*empty*/
    }
  },

  fetchAndSetStarknetBalance: async (address: string) => {
    const { assets } = get();
    if (!assets) return;

    const starknetAsset = Object.values(assets).find((asset) =>
      isStarknet(asset.chain)
    );

    if (!starknetAsset) return;

    const starknetBalance: Record<string, BigNumber | undefined> = {};
    const balance = await getStarknetTokenBalance(address, starknetAsset);

    const orderPair = getOrderPair(
      starknetAsset.chain,
      starknetAsset.tokenAddress
    );
    starknetBalance[orderPair] = new BigNumber(balance);
    set({ balances: { ...get().balances, ...starknetBalance } });
  },

  fetchAndSetSolanaBalance: async (address: PublicKey) => {
    const { assets } = get();
    if (!assets) return;

    const solanaAssets = Object.values(assets).filter((asset) =>
      isSolana(asset.chain)
    );

    if (!solanaAssets.length) return;
    const solanaBalance: Record<string, BigNumber | undefined> = {};

    for (const asset of solanaAssets) {
      const balance = await getSolanaTokenBalance(address, asset);
      const orderPair = getOrderPair(asset.chain, asset.tokenAddress);

      // Check if it's native SOL - when tokenAddress equals atomicSwapAddress, it's a native token
      const isNativeSOL = asset.tokenAddress === asset.atomicSwapAddress;

      if (isNativeSOL) {
        const gas = 0.00380608;
        solanaBalance[orderPair] = new BigNumber(
          Math.max(0, Number((Number(balance) - gas).toFixed(8)))
        );
      } else solanaBalance[orderPair] = new BigNumber(balance);
    }
    set({ balances: { ...get().balances, ...solanaBalance } });
  },

  fetchAndSetSuiBalance: async (address: string) => {
    const { assets } = get();
    if (!assets) return;

    const suiAsset = Object.values(assets).find((asset) => isSui(asset.chain));

    if (!suiAsset) return;
    const suiBalance: Record<string, BigNumber | undefined> = {};

    const balance = await getSuiTokenBalance(address, suiAsset);
    const orderPair = getOrderPair(suiAsset.chain, suiAsset.tokenAddress);
    suiBalance[orderPair] = new BigNumber(balance);
    set({ balances: { ...get().balances, ...suiBalance } });
  },

  clearBalances: () =>
    set({
      balances: {},
    }),
  isRouteValid: (from: AssetConfig, to: AssetConfig) => {
    const { routeValidator } = get();

    if (!routeValidator || !from || !to || !from.asset || !to.asset) {
      console.log("Missing routeValidator, from, or to. Returning true.");
      return true;
    }

    try {
      const fromChainAsset = ChainAsset.from(from.asset);
      const toChainAsset = ChainAsset.from(to.asset);

      const isValid = routeValidator.isValidRoute(fromChainAsset, toChainAsset);
      // console.log("Route validation result:", isValid);
      return isValid;
    } catch (error) {
      console.error("Error in isRouteValid:", error);
      return true;
    }
  },

  getValidDestinations: (fromAsset: AssetConfig) => {
    const { routeValidator, assets } = get();
    if (!routeValidator || !assets || !fromAsset.asset) {
      return Object.values(assets || {});
    }

    try {
      const fromChainAsset = ChainAsset.from(fromAsset.asset);
      const allChainAssets = Object.values(assets).map((asset) => {
        const assetId = asset.asset;
        return ChainAsset.from(assetId);
      });

      const validChainAssets = routeValidator.getValidDestinations(
        fromChainAsset,
        allChainAssets
      );

      // Convert back to Asset objects
      return validChainAssets
        .map((chainAsset) => {
          const assetId = chainAsset.toString();
          return Object.values(assets).find((asset) => {
            const assetAssetId = asset.asset
              ? asset.asset!
              : `${asset.chain}:${asset.symbol.toLowerCase()}`;
            return assetAssetId === assetId;
          });
        })
        .filter(Boolean) as AssetConfig[];
    } catch (error) {
      console.error("Error in getValidDestinations:", error);
      return Object.values(assets || {});
    }
  },
}));
