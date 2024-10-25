import { create } from "zustand";
import { API } from "../constants/api";
import axios from "axios";
import { IOType } from "../constants/constants";
import { Chain } from "@gardenfi/orderbook";

export type AssetData = {
  name: string;
  decimals: number;
  symbol: string;
  baseFees: number;
  logo: string;
  coinGeckoId: string;
  tokenAddress: string;
  atomicSwapAddress: string;
};

export type ChainData = {
  chainId: number;
  fillerAddresses: string[];
  explorer: string;
  networkLogo: string;
  networkType: string;
  assetConfig: AssetData[];
  name: string;
  identifier: Chain;
};

export type AssetsData = Record<Chain, ChainData>;

type AssetInfoState = {
  assetsData: AssetsData | null;
  isLoading: boolean;
  isAssetSelectorOpen: {
    isOpen: boolean;
    type: IOType;
  };
  error: string | null;
  fetchAssetsData: () => Promise<void>;
  setOpenAssetSelector: (type: IOType) => void;
  setCloseAssetSelector: () => void;
};

export const assetInfoStore = create<AssetInfoState>((set) => ({
  assetsData: null,
  isAssetSelectorOpen: {
    isOpen: false,
    type: IOType.input,
  },
  isLoading: false,
  error: null,

  fetchAssetsData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get<{ data: { networks: AssetsData } }>(
        API().data.assets,
      );

      if (response.status === 200) {
        set({ assetsData: response.data.data.networks });
      } else {
        set({ error: "Failed to fetch assets info" });
      }
    } catch (error) {
      console.error(error);
      set({ error: "An error occurred while fetching assets info" });
    } finally {
      set({ isLoading: false });
    }
  },
  setOpenAssetSelector: (type) =>
    set({
      isAssetSelectorOpen: {
        isOpen: true,
        type,
      },
    }),

  setCloseAssetSelector: () =>
    set({
      isAssetSelectorOpen: {
        isOpen: false,
        type: IOType.input,
      },
    }),
}));
