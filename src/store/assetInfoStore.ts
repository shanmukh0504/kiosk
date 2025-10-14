import { create } from "zustand";
import { IOType, SUPPORTED_CHAINS } from "../constants/constants";
import {
  Asset,
  Chain,
  ChainAsset,
  RouteValidator,
  buildRouteMatrix,
} from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import logger from "../utils/logger";
import { parseAssetNameSymbol } from "../utils/utils";

// Internal Types
type BaseChainData = {
  id: string;
  chain: string | Chain;
  icon: string;
  explorer_url: string;
  confirmation_target: number;
  source_timelock: string;
  destination_timelock: string;
  supported_htlc_schemas: string[];
  supported_token_schemas: string[];
};

export type ChainData = BaseChainData & {
  chain: Chain;
  name: string;
};

export type ApiChainData = BaseChainData & {
  assets: Asset[];
};

export type ApiChainsResponse = {
  status: string;
  result: ApiChainData[];
};

export type FiatResponse = {
  status: string;
  result: Record<string, string>;
};

export type Assets = Record<string, Asset>;
export type Chains = Partial<Record<Chain, ChainData>>;

function parseChainIdentifier(chainName: string): Chain | null {
  return SUPPORTED_CHAINS.includes(chainName as Chain)
    ? (chainName as Chain)
    : null;
}

function formatChainName(chainName: string): string {
  return chainName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type AssetInfoState = {
  allChains: Chains | null;
  allAssets: Assets | null;
  assets: Assets | null;
  chains: Chains | null;
  routeValidator: RouteValidator | null;
  routeMatrix: Record<string, ChainAsset[]> | null;
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
  isRouteValid: (from: Asset, to: Asset) => boolean;
  getValidDestinations: (fromAsset: Asset) => Asset[];
};

export const assetInfoStore = create<AssetInfoState>((set, get) => ({
  assets: null,
  chains: null,
  allAssets: null,
  allChains: null,
  routeValidator: null,
  routeMatrix: null,
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
      // Initialize and load the route policy once
      const validator = new RouteValidator(
        API().quote.quote.origin,
        API().api_key
      );
      await validator.loadPolicy();
      set({ routeValidator: validator });
      const res = await axios.get<ApiChainsResponse>(
        API().data.chains().toString()
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

        const chainData: ChainData = {
          ...apiChain,
          name: formatChainName(apiChain.chain),
          chain: chainIdentifier,
        };

        allChains[chainIdentifier] = chainData;
        let totalAssets = 0;

        for (const apiAsset of apiChain.assets) {
          const tokenKey = ChainAsset.from(apiAsset.id).toString();

          const { name: assetName, symbol: assetSymbol } = parseAssetNameSymbol(
            apiAsset.name,
            apiAsset.id
          );

          const Asset: Asset = {
            ...apiAsset,
            id: ChainAsset.from(apiAsset.id),
            chain: chainIdentifier,
            name: assetName,
            symbol: assetSymbol,
          };

          allAssets[tokenKey] = Asset;
          assets[tokenKey] = Asset;
          totalAssets++;
        }

        if (totalAssets > 0) {
          chains[chainIdentifier] = chainData;
        }
      }

      // Build route matrix for fast lookups
      const allChainAssets = Object.values(allAssets)
        .map((asset) => {
          if (!asset.id) return null;
          try {
            return ChainAsset.from(asset.id);
          } catch {
            return null;
          }
        })
        .filter((asset): asset is ChainAsset => asset !== null);

      const routeMatrix = buildRouteMatrix(allChainAssets, validator);

      set({ allAssets, allChains, assets, chains, routeMatrix });
    } catch (error) {
      logger.error("failed to fetch assets data ❌", error);
      set({ error: "Failed to fetch assets data" });
    } finally {
      set({ isLoading: false });
    }
  },

  isRouteValid: (from: Asset, to: Asset) => {
    const { routeValidator } = get();

    if (!routeValidator || !from || !to || !from.id || !to.id) {
      console.log("Missing routeValidator, from, or to. Returning true.");
      return true;
    }

    try {
      const fromChainAsset = ChainAsset.from(from.id);
      const toChainAsset = ChainAsset.from(to.id);

      const isValid = routeValidator.isValidRoute(fromChainAsset, toChainAsset);
      // console.log("Route validation result:", isValid);
      return isValid;
    } catch (error) {
      console.error("Error in isRouteValid:", error);
      return true;
    }
  },

  getValidDestinations: (fromAsset: Asset) => {
    const { routeMatrix, assets } = get();

    // If no route matrix or assets, return all assets as fallback
    if (!routeMatrix || !assets || !fromAsset.id) {
      return Object.values(assets || {});
    }

    try {
      // Use cached route matrix for O(1) lookup instead of recalculating
      const validChainAssets = routeMatrix[fromAsset.id.toString()];

      if (!validChainAssets) {
        // If asset not found in matrix, return all assets as fallback
        return Object.values(assets);
      }

      // Convert ChainAsset array back to Asset array
      return validChainAssets
        .map((chainAsset) => {
          const assetId = chainAsset.toString();
          return Object.values(assets).find((asset) => {
            const assetAssetId = ChainAsset.from(asset).toString();
            return assetAssetId === assetId;
          });
        })
        .filter(Boolean) as Asset[];
    } catch (error) {
      console.error("Error in getValidDestinations:", error);
      return Object.values(assets || {});
    }
  },
}));
