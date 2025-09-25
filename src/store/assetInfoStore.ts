import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import {
  Asset,
  Chain,
  EvmChain,
  isBitcoin,
  isEVM,
  isEvmNativeToken,
  isSolana,
  isSolanaNativeToken,
  isStarknet,
  isSui,
} from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import {
  BitcoinNetwork,
  BitcoinProvider,
  Quote,
  Strategies,
} from "@gardenfi/core";
import { generateTokenKey } from "../utils/generateTokenKey";
import { PublicKey } from "@solana/web3.js";

type AssetConfig = Asset & {
  disabled?: boolean;
};
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

export type Networks = {
  [chain in Chain]: ChainData & { assetConfig: Omit<AssetConfig, "chain">[] };
};

export type ChainData = {
  chainId: number;
  explorer: string;
  networkLogo: string;
  networkType: string;
  name: string;
  identifier: Chain;
  disabled: boolean;
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
    const maxRetries = 3;
    const abortAfterMs = 3000;
    let attempt = 0;

    const fetchAssetsWithRetry = async (): Promise<Networks> => {
      try {
        const res = await axios.get<Networks>(
          API().data.assets(network).toString(),
          { timeout: abortAfterMs }
        );
        return res.data;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.log("Failed to fetch assets data ❌", error);
          return {} as Networks;
        }

        const delay = 100 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchAssetsWithRetry();
      }
    };

    try {
      set({ isLoading: true });
      const assetsData = await fetchAssetsWithRetry();

      const allChains: Chains = {};
      const allAssets: Assets = {};
      const assets: Assets = {};
      const chains: Chains = {};

      for (const chainInfo of Object.values(assetsData)) {
        if (!SUPPORTED_CHAINS.includes(chainInfo.identifier)) continue;

        allChains[chainInfo.identifier] = {
          chainId: chainInfo.chainId,
          explorer: chainInfo.explorer,
          networkLogo: chainInfo.networkLogo,
          networkType: chainInfo.networkType,
          name: chainInfo.name,
          identifier: chainInfo.identifier,
          disabled: chainInfo.disabled,
        };
        let totalAssets = 0;

        for (const asset of chainInfo.assetConfig) {
          const tokenKey = generateTokenKey(
            chainInfo.identifier,
            asset.atomicSwapAddress
          );
          allAssets[tokenKey] = {
            ...asset,
            chain: chainInfo.identifier,
          };
          if (!asset.disabled && !chainInfo.disabled) {
            assets[tokenKey] = allAssets[tokenKey];
            totalAssets++;
          }
        }

        if (totalAssets > 0) {
          chains[chainInfo.identifier] = allChains[chainInfo.identifier];
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
            chain as EvmChain,
            workingRPCs
          );

          const updatedBalances: Record<string, BigNumber | undefined> = {};

          for (const asset of assets!) {
            const orderKey = getOrderPair(chain, asset.tokenAddress);
            let balance = chainBalances[asset.tokenAddress];

            if (
              balance &&
              balance.gt(0) &&
              isEvmNativeToken(chain as EvmChain, asset.tokenAddress)
            ) {
              const fee = await getLegacyGasEstimate(
                chain as EvmChain,
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
        network === "mainnet" ? BitcoinNetwork.Mainnet : BitcoinNetwork.Testnet
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

      if (isSolanaNativeToken(asset.chain, asset.tokenAddress)) {
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
