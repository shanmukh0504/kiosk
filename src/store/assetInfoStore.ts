import { create } from "zustand";
import { IOType } from "../constants/constants";
import { Asset, Chain } from "@gardenfi/orderbook";

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
  setAssets: (assets: Assets) => void;
  setChains: (chains: Chains) => void;
  setError: (error: string) => void;
  setLoading: (isLoading: boolean) => void;
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

  setAssets: (assets) =>
    set({
      assets,
    }),

  setChains: (chains) =>
    set({
      chains,
    }),

  setError: (error) =>
    set({
      error,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),
}));
