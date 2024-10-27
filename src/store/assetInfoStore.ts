import { create } from "zustand";
import { IOType } from "../constants/constants";
import { Asset, Chain } from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";

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
  setOpenAssetSelector: (type: IOType) => void;
  CloseAssetSelector: () => void;
  fetchAndSetAssetsAndChains: () => Promise<void>;
};

export const assetInfoStore = create<AssetInfoState>((set) => ({
  assets: null,
  chains: null,
  isAssetSelectorOpen: {
    isOpen: false,
    type: IOType.input,
  },
  isLoading: false,
  error: null,

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
        isOpen: false,
        type: IOType.input,
      },
    }),

  fetchAndSetAssetsAndChains: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.get<{
        data: { networks: Networks };
      }>(API().data.assets);
      const assetsData = res.data.data.networks;

      const assets: Assets = {};
      const chains: Chains = {};

      for (const chainInfo of Object.values(assetsData)) {
        chains[chainInfo.identifier] = {
          chainId: chainInfo.chainId,
          explorer: chainInfo.explorer,
          networkLogo: chainInfo.networkLogo,
          networkType: chainInfo.networkType,
          name: chainInfo.name,
          identifier: chainInfo.identifier,
        };
        for (const asset of chainInfo.assetConfig) {
          assets[`${chainInfo.identifier}_${asset.atomicSwapAddress}`] = {
            ...asset,
            chain: chainInfo.identifier,
          };
        }
      }
      set({ assets, chains });
    } catch (error) {
      set({ error: "Failed to fetch assets data" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
