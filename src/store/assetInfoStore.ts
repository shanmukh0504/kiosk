import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import {
  Asset,
  Chain,
  EvmChain,
  isBitcoin,
  isStarknet,
} from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import { Quote, Strategies } from "@gardenfi/core";
import { generateTokenKey } from "../utils/generateTokenKey";

type AssetConfig = Asset & {
  disabled?: boolean;
};
import BigNumber from "bignumber.js";
import { getBalanceMulticall } from "../utils/getBalanceMulticall";
import { IInjectedBitcoinProvider } from "@gardenfi/wallet-connectors";
import { getOrderPair } from "../utils/utils";

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
  btcBalance: Record<string, BigNumber | undefined>;
  starknetBalance: Record<string, BigNumber | undefined>;
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
  fetchAndSetEvmBalances: (address: string) => Promise<void>;
  fetchAndSetBitcoinBalance: (
    provider: IInjectedBitcoinProvider
  ) => Promise<void>;
  SetStarknetBalance: (balance: string) => void;
  clearBalances: () => void;
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  allAssets: null,
  allChains: null,
  fiatData: {},
  balances: {},
  btcBalance: {},
  starknetBalance: {},
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
      if (res.error) return;
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
      const res = await axios.get<FiatResponse>(
        API().quote.fiatValues.toString()
      );
      const fiatData = res.data.result.reduce(
        (acc, fiat) => {
          acc[`${fiat.chain}_${fiat.htlc_address.toLowerCase()}`] =
            fiat.token_price;
          return acc;
        },
        {} as Record<string, number | undefined>
      );
      set({ fiatData });
    } catch {
      set({ fiatData: {} });
    }
  },
  fetchAndSetEvmBalances: async (address: string) => {
    const { assets } = get();
    if (!assets) return;

    const tokenAddressesAccordingToChain = Object.values(assets).reduce(
      (acc, asset) => {
        acc[asset.chain] = [...(acc[asset.chain] || []), asset.tokenAddress];
        return acc;
      },
      {} as Record<Chain, string[]>
    );

    const balancePromises = Object.entries(tokenAddressesAccordingToChain).map(
      async ([chain, tokenAddresses]) => ({
        [chain]: await getBalanceMulticall(
          tokenAddresses,
          address,
          chain as EvmChain
        ),
      })
    );

    const balances = await Promise.all(balancePromises);
    const balancesObject = balances.reduce(
      (acc, chainBalance) => {
        Object.entries(chainBalance).forEach(([chain, balances]) => {
          Object.entries(balances).forEach(([tokenAddress, balance]) => {
            acc[getOrderPair(chain, tokenAddress)] = balance;
          });
        });
        return acc;
      },
      {} as Record<string, BigNumber | undefined>
    );

    set({ balances: balancesObject });
  },

  fetchAndSetBitcoinBalance: async (provider: IInjectedBitcoinProvider) => {
    const { assets } = get();
    if (!assets || !provider) return;
    try {
      const balance = await provider.getBalance();
      const formattedBalance = balance && new BigNumber(balance.val.total);
      let btcBalance: Record<string, BigNumber | undefined> = {};
      Object.values(assets).forEach((asset) => {
        if (isBitcoin(asset.chain)) {
          btcBalance[getOrderPair(asset.chain, asset.tokenAddress)] =
            formattedBalance;
        }
      });
      set({ btcBalance });
    } catch (error) {
      console.error(`Failed to fetch Bitcoin balance`, error);
    }
  },
  SetStarknetBalance(balance: string) {
    const { assets } = get();
    if (!assets) return;
    const formattedBalance = new BigNumber(balance.slice(0, 12));
    let starknetBalance: Record<string, BigNumber | undefined> = {};
    Object.values(assets).forEach((asset) => {
      if (isStarknet(asset.chain)) {
        starknetBalance[getOrderPair(asset.chain, asset.tokenAddress)] =
          formattedBalance;
      }
    });
    set({ starknetBalance });
  },
  clearBalances: () =>
    set({
      balances: {},
      btcBalance: {},
      starknetBalance: {},
    }),
}));
