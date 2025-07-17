import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import {
  Asset,
  Chain,
  EvmChain,
  isBitcoin,
  isEVM,
  isSolana,
  isStarknet,
} from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import { Quote, Strategies } from "@gardenfi/core";
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
} from "../utils/getTokenBalance";
import { Hex } from "viem";

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
  fetchAndSetAssetsAndChains: () => Promise<void>;
  fetchAndSetStrategies: () => Promise<void>;
  fetchAndSetFiatValues: () => Promise<void>;
  fetchAndSetEvmBalances: (
    address: string,
    workingRpcs: Record<number, string[]>,
    fetchOnlyAsset?: Asset
  ) => Promise<void>;
  fetchAndSetBitcoinBalance: (
    provider: IInjectedBitcoinProvider
  ) => Promise<void>;
  fetchAndSetStarknetBalance: (address: string) => Promise<void>;
  fetchAndSetSolanaBalance: (address: PublicKey) => Promise<void>;
  clearBalances: () => void;
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  allAssets: null,
  allChains: null,
  fiatData: {},
  balances: {},
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
      const res = await axios.get<Networks>(
        API().data.assets(network).toString()
      );
      const assetsData = res.data;

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
      console.error("Failed to fetch assets data", error);
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

  fetchAndSetEvmBalances: async (
    address: string,
    workingRpcs: Record<number, string[]>,
    fetchOnlyAsset?: Asset
  ) => {
    const { assets } = get();
    if (!assets) return;

    let tokensByChain: Partial<Record<Chain, string[]>> = {};
    if (fetchOnlyAsset)
      tokensByChain[fetchOnlyAsset.chain] = [fetchOnlyAsset.tokenAddress];
    else {
      tokensByChain = Object.values(assets).reduce(
        (acc, asset) => {
          if (!isEVM(asset.chain)) return acc;
          if (!acc[asset.chain]) acc[asset.chain] = [];
          acc[asset.chain].push(asset.tokenAddress);
          return acc;
        },
        {} as Record<Chain, string[]>
      );
    }

    try {
      const balanceResults = await Promise.allSettled(
        Object.entries(tokensByChain).map(async ([chain, tokenAddresses]) => {
          const chainBalances = await getBalanceMulticall(
            tokenAddresses as Hex[],
            address as Hex,
            chain as EvmChain,
            workingRpcs
          );

          return Object.entries(chainBalances).reduce(
            (acc, [tokenAddress, balance]) => {
              acc[getOrderPair(chain, tokenAddress)] = balance;
              return acc;
            },
            {} as Record<string, BigNumber | undefined>
          );
        })
      );
      const balances = balanceResults.reduce((acc, result) => {
        return result.status === "fulfilled"
          ? { ...acc, ...result.value }
          : acc;
      }, {});

      set({ balances: { ...get().balances, ...balances } });
    } catch {
      /*empty*/
    }
  },

  fetchAndSetBitcoinBalance: async (provider: IInjectedBitcoinProvider) => {
    const { assets, balances } = get();
    if (!assets || !provider) return;

    try {
      const balance = await provider.getBalance();
      if (!balance?.val?.total) return;

      const formattedBalance = new BigNumber(balance.val.confirmed);
      const btcBalance = Object.values(assets)
        .filter((asset) => isBitcoin(asset.chain))
        .reduce(
          (acc, asset) => {
            acc[getOrderPair(asset.chain, asset.tokenAddress)] =
              formattedBalance;
            return acc;
          },
          {} as Record<string, BigNumber | undefined>
        );

      set({ balances: { ...balances, ...btcBalance } });
    } catch {
      /*empty*/
    }
  },

  fetchAndSetStarknetBalance: async (address: string) => {
    const { assets, balances } = get();
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
    set({ balances: { ...balances, ...starknetBalance } });
  },

  fetchAndSetSolanaBalance: async (address: PublicKey) => {
    const { assets, balances } = get();
    if (!assets) return;
    const solanaAssets = Object.values(assets).filter((asset) =>
      isSolana(asset.chain)
    );

    if (solanaAssets.length === 0) return;

    const solanaBalances: Record<string, BigNumber | undefined> = {};

    for (const asset of solanaAssets) {
      try {
        const balance = await getSolanaTokenBalance(address, asset);
        const orderPair = getOrderPair(asset.chain, asset.tokenAddress);
        solanaBalances[orderPair] = new BigNumber(balance);
      } catch (err) {
        continue;
      }
    }

    set({ balances: { ...balances, ...solanaBalances } });
  },

  clearBalances: () =>
    set({
      balances: {},
    }),
}));
