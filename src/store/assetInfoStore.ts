import { create } from "zustand";
import { IOType, network, SUPPORTED_CHAINS } from "../constants/constants";
import { Asset, Chain } from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import { IQuote, Strategies } from "@gardenfi/core";
import { generateTokenKey } from "../utils/generateTokenKey";
import { Network } from "@gardenfi/utils";

export type Networks = {
  [chain in Chain]: ChainData & { assetConfig: Omit<Asset, "chain">[] };
};

export type ChainData = {
  chainId: number;
  explorer: string;
  networkLogo: string;
  networkType: string;
  name: string;
  identifier: Chain;
};

export type Assets = Record<string, Asset>;
export type Chains = Partial<Record<Chain, ChainData>>;

type AssetInfoState = {
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
  fetchAndSetStrategies: (quote: IQuote) => Promise<void>;
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
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
        API()
          .data.assets(network as Network)
          .toString()
      );
      const assetsData = res.data;

      const assets: Assets = {};
      const chains: Chains = {};

      for (const chainInfo of Object.values(assetsData)) {
        if (!SUPPORTED_CHAINS.includes(chainInfo.identifier)) continue;

        chains[chainInfo.identifier] = {
          chainId: chainInfo.chainId,
          explorer: chainInfo.explorer,
          networkLogo: chainInfo.networkLogo,
          networkType: chainInfo.networkType,
          name: chainInfo.name,
          identifier: chainInfo.identifier,
        };

        for (const asset of chainInfo.assetConfig) {
          assets[
            generateTokenKey(chainInfo.identifier, asset.atomicSwapAddress)
          ] = {
            ...asset,
            chain: chainInfo.identifier,
          };
        }
      }
      set({ assets, chains });
    } catch (error) {
      console.error("Failed to fetch assets data", error);
      set({ error: "Failed to fetch assets data" });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchAndSetStrategies: async (quote) => {
    try {
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
