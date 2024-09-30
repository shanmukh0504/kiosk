import { create } from "zustand";
import { API } from "../constants/api";
import axios from "axios";

type AssetData = {
  name: string;
  decimals: number;
  symbol: string;
  baseFees: number;
  logo: string;
  coinGeckoId: string;
  tokenAddress: string;
  atomicSwapAddress: string;
};

type ChainData = {
  chainId: number;
  fillerAddresses: string[];
  explorer: string;
  networkLogo: string;
  networkType: string;
  assetConfig: AssetData[];
};

type AssetsData = {
  data: {
    networks: Map<string, ChainData>;
  };
};

type AssetInfoState = {
  assetsData: AssetsData | null;
  isLoading: boolean;
  error: string | null;
  fetchAssetsData: () => Promise<void>;
};

export const assetInfoStore = create<AssetInfoState>((set) => ({
  assetsData: null,
  isLoading: false,
  error: null,

  fetchAssetsData: async () => {
    set({ isLoading: true, error: null });

    try {
      const api = API();
      const response = await axios.get<AssetsData>(api.assets);

      if (response.status === 200) {
        set({ assetsData: response.data });
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
}));
