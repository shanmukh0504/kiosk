import { create } from "zustand";
import { IOType } from "../constants/constants";
import {
  Asset,
  Chain,
  ChainAsset,
  RouteValidator,
  AssetManager,
  ChainData,
} from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import logger from "../utils/logger";

export type FiatResponse = {
  status: string;
  result: Record<string, string>;
};

export type Assets = Record<string, Asset>;
export type Chains = Partial<Record<Chain, ChainData>>;

type AssetInfoState = {
  assets: Assets | null;
  chains: Chains | null;
  routeValidator: RouteValidator | null;
  routeMatrix: Record<string, ChainAsset[]> | null;
  assetManager: AssetManager | null;
  fiatData: Record<string, number | undefined>;
  isLoading: boolean;
  isAssetSelectorOpen: {
    isOpen: boolean;
    type: IOType;
  };
  error: string | null;
  setOpenAssetSelector: (type: IOType) => void;
  fetchAndSetFiatValues: () => Promise<void>;
  CloseAssetSelector: () => void;
  fetchAndSetAssetsAndChains: () => Promise<void>;
  isRouteValid: (from: Asset, to: Asset) => Promise<boolean>;
  getValidDestinations: (fromAsset: Asset) => Asset[];
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  routeValidator: null,
  routeMatrix: null,
  assetManager: null,
  fiatData: {},
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
        type: get().isAssetSelectorOpen.type,
        isOpen: false,
      },
    }),

  fetchAndSetFiatValues: async () => {
    try {
      const { data } = await axios.get<FiatResponse>(
        API().quote.fiatValues.toString()
      );

      const fiatData = Object.entries(data.result).reduce(
        (acc, [key, value]) => {
          acc[key] = typeof value === "string" ? Number(value) : value;
          return acc;
        },
        {} as Record<string, number>
      );

      set({ fiatData });
    } catch {
      /*empty*/
    }
  },

  fetchAndSetAssetsAndChains: async () => {
    try {
      set({ isLoading: true });
      const manager = new AssetManager(
        {
          baseUrl: API().baseUrl,
        },
        API().api_key
      );
      await manager.initialize();

      await manager.buildRouteMatrix();
      console.log(manager.routeMatrix);
      console.log(manager.routeValidator);
      console.log(manager.assets);
      console.log(manager.chains);

      set({
        assetManager: manager,
        routeValidator: manager.routeValidator,
        routeMatrix: manager.routeMatrix,
        assets: manager.assets,
        chains: manager.chains,
      });
    } catch (error) {
      logger.error("failed to fetch assets data ❌", error);
      set({ error: "Failed to fetch assets data" });
    } finally {
      set({ isLoading: false });
    }
  },

  isRouteValid: async (from: Asset, to: Asset): Promise<boolean> => {
    const { assetManager } = get();
    if (!assetManager) return false;
    return await assetManager.isRouteValid(from, to);
  },

  getValidDestinations: (fromAsset: Asset) => {
    const { assetManager, assets } = get();
    if (!assetManager) return Object.values(assets || {});

    return assetManager.getValidDestinations(fromAsset);
  },
}));
