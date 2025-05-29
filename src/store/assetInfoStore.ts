import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import { Asset, Chain } from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import { Quote, Strategies } from "@gardenfi/core";
import { generateTokenKey } from "../utils/generateTokenKey";

type AssetConfig = Asset & {
  disabled?: boolean;
};

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

export type Assets = Record<string, AssetConfig>;
export type Chains = Partial<Record<Chain, ChainData>>;

type AssetInfoState = {
  allChains: Chains | null;
  allAssets: Assets | null;
  assets: Assets | null;
  chains: Chains | null;
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
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  allAssets: null,
  allChains: null,
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
}));
