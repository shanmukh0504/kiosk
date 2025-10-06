import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import {
  Asset,
  Chain,
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
import { BitcoinProvider, Quote, Strategies } from "@gardenfi/core";
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
  networkType: string;
  name: string;
  identifier: Chain;
  disabled: boolean;
  confirmationTarget: number;
  sourceTimelock: string;
  destinationTimelock: string;
  supportedHtlcSchemas: string[];
  supportedTokenSchemas: string[];
};

export type AssetConfig = Asset & {
  chainData?: ChainData;
  asset?: string;
  disabled?: boolean;
  price?: number;
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

//TODO: Botanix Bitcoin
function formatAssetName(symbol: string): string {
  const assetNames: Record<string, string> = {
    BTC: "Bitcoin",
    WBTC: "Wrapped Bitcoin",
    CBBTC: "Coinbase Wrapped Bitcoin",
    IBTC: "iBTC",
    CBTC: "Citrea Bitcoin",
    WCBTC: "Wrapped Citrea Bitcoin",
    SOL: "Solana",
    USDC: "USD Coin",
    USDT: "Tether USD",
    SUI: "Sui",
    SEED: "SEED",
    UBTC: "Unit Bitcoin",
    ETH: "Ethereum",
    BTCN: "Bitcorn",
    LBTC: "Lombard Bitcoin",
    BTCB: "Binance Bitcoin",
  };

  return assetNames[symbol] || symbol;
}

type AssetInfoState = {
  allChains: Chains | null;
  allAssets: Assets | null;
  assets: Assets | null;
  chains: Chains | null;
  fiatData: Record<string, number | undefined>;
  balances: Record<string, BigNumber | undefined>;
  workingRPCs: Record<number, string[]>;
  isLoading: boolean;
  isAssetSelectorOpen: {
    isOpen: boolean;
    type: IOType;
  };
  error: string | null;
  strategies: {
    val: Strategies | null;
    error: string | null;
    isLoading: boolean;
  };
  setOpenAssetSelector: (type: IOType) => void;
  CloseAssetSelector: () => void;
  fetchAndSetRPCs: () => Promise<void>;
  fetchAndSetAssetsAndChains: () => Promise<void>;
  fetchAndSetStrategies: () => Promise<void>;
  fetchAndSetFiatValues: () => Promise<void>;
  fetchAndSetEvmBalances: (
    address: string,
    fetchOnlyAsset?: Asset
  ) => Promise<void>;
  fetchAndSetBitcoinBalance: (
    provider: IInjectedBitcoinProvider,
    address: string
  ) => Promise<void>;
  fetchAndSetStarknetBalance: (address: string) => Promise<void>;
  fetchAndSetSolanaBalance: (address: PublicKey) => Promise<void>;
  fetchAndSetSuiBalance: (address: string) => Promise<void>;
  clearBalances: () => void;
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  allAssets: null,
  allChains: null,
  fiatData: {},
  balances: {},
  workingRPCs: {},
  isAssetSelectorOpen: {
    isOpen: false,
    type: IOType.input,
  },
  isLoading: false,
  error: null,
  strategies: {
    val: null,
    error: null,
    isLoading: false,
  },
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

        // Determine network type from the id field
        const networkType = apiChain.id.includes("evm")
          ? "evm"
          : apiChain.id.includes("solana")
            ? "solana"
            : apiChain.id.includes("sui")
              ? "sui"
              : apiChain.id.includes("starknet")
                ? "starknet"
                : apiChain.id.includes("bitcoin")
                  ? "bitcoin"
                  : "other";

        const chainData: ChainData = {
          chainId,
          explorer: apiChain.explorer_url,
          networkLogo: apiChain.icon,
          networkType,
          name: formatChainName(apiChain.chain),
          identifier: chainIdentifier,
          disabled: false, // API doesn't have disabled field, default to false
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
          const assetName = formatAssetName(assetSymbol);

          const assetConfig: AssetConfig = {
            asset: apiAsset.id,
            chain: chainIdentifier,
            atomicSwapAddress,
            tokenAddress,
            decimals: apiAsset.decimals,
            name: assetName,
            symbol: assetSymbol,
            logo: apiAsset.icon,
            disabled: false,
            price: apiAsset.price,
            chainData, // Include chain data in each asset
          };

          allAssets[tokenKey] = assetConfig;

          if (!assetConfig.disabled && !chainData.disabled) {
            assets[tokenKey] = assetConfig;
            totalAssets++;
          }
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

  fetchAndSetStrategies: async () => {
    try {
      const quote = new Quote(API().quote.quote.toString());
      set({ strategies: { ...get().strategies, isLoading: true } });
      const res = await quote.getStrategies();
      if (!res.ok) return;

      set({ strategies: { val: res.val, isLoading: false, error: null } });
    } catch {
      set({
        strategies: {
          ...get().strategies,
          error: "Failed to fetch strategies",
          isLoading: false,
        },
      });
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

  fetchAndSetEvmBalances: async (address: string, fetchOnlyAsset?: Asset) => {
    const { assets, workingRPCs } = get();
    if (!assets) return;

    let tokensByChain: Partial<Record<Chain, Asset[]>> = {};
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
}));
