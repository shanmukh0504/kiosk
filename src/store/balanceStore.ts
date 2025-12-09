import { create } from "zustand";
import { IOType } from "../constants/constants";
import { ChainAsset } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { assetInfoStore } from "./assetInfoStore";
import { balanceSSEService } from "../utils/balanceSSEService";

type BalanceStoreState = {
  balances: Record<string, BigNumber | undefined>;
  isLoading: boolean;
  isAssetSelectorOpen: {
    isOpen: boolean;
    type: IOType;
  };
  error: string | null;
  setOpenAssetSelector: (type: IOType) => void;
  CloseAssetSelector: () => void;
  balanceFetched: boolean;

  // SSE subscription management
  subscriptions: Map<string, () => void>;

  // New unified balance fetching methods
  connectBalanceStream: (
    chainType: "bitcoin" | "evm" | "starknet" | "solana" | "sui",
    address: string
  ) => void;
  disconnectBalanceStream: (
    chainType: "bitcoin" | "evm" | "starknet" | "solana" | "sui",
    address: string
  ) => void;
  disconnectAllStreams: () => void;

  clearBalances: () => void;
};

export const balanceStore = create<BalanceStoreState>((set, get) => ({
  balanceFetched: false,
  balances: {},
  subscriptions: new Map(),
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

  connectBalanceStream: (chainType, address) => {
    const key = `${chainType}:${address}`;
    const { subscriptions } = get();

    if (subscriptions.has(key)) {
      balanceSSEService.subscribe(
        chainType,
        address,
        async (rawBalances) => {
          const assets = assetInfoStore.getState().assets;
          if (!assets) {
            return;
          }

          const updatedBalances: Record<string, BigNumber | undefined> = {};
          const notMatchedAssets: string[] = [];

          for (const [assetId, balance] of Object.entries(rawBalances)) {
            const matchingAsset = Object.values(assets).find((asset) => {
              if ((asset as any).formatted === assetId) return true;

              if (asset.id === assetId) return true;

              const [chainPart, symbolPart] = assetId.split(":");
              const chainMatch = asset.chain === chainPart;
              const symbolMatch = asset.symbol.toLowerCase() === symbolPart?.toLowerCase();
              return chainMatch && symbolMatch;
            });

            if (matchingAsset) {
              const assetKey = ChainAsset.from(matchingAsset.id).toString();
              updatedBalances[assetKey] = balance;
            } else {
              notMatchedAssets.push(assetId);
            }
          }
          const currentBalances = get().balances;
          const newBalances = {
            ...currentBalances,
            ...updatedBalances,
          };

          set({
            balances: newBalances,
            balanceFetched: true,
          });
        }
      );
      return;
    }

    const unsubscribe = balanceSSEService.subscribe(
      chainType,
      address,
      async (rawBalances) => {
        const assets = assetInfoStore.getState().assets;
        if (!assets) {
          return;
        }

        const updatedBalances: Record<string, BigNumber | undefined> = {};
        const notMatchedAssets: string[] = [];

        for (const [assetId, balance] of Object.entries(rawBalances)) {
          const matchingAsset = Object.values(assets).find((asset) => {
            if ((asset as any).formatted === assetId) return true;

            if (asset.id === assetId) return true;

            const [chainPart, symbolPart] = assetId.split(":");
            const chainMatch = asset.chain === chainPart;
            const symbolMatch = asset.symbol.toLowerCase() === symbolPart?.toLowerCase();
            return chainMatch && symbolMatch;
          });

          if (matchingAsset) {
            const assetKey = ChainAsset.from(matchingAsset.id).toString();
            updatedBalances[assetKey] = balance;
          } else {
            notMatchedAssets.push(assetId);
          }
        }

        const currentBalances = get().balances;
        const newBalances = {
          ...currentBalances,
          ...updatedBalances,
        };

        set({
          balances: newBalances,
          balanceFetched: true,
        });
      }
    );

    subscriptions.set(key, unsubscribe);
    set({ subscriptions: new Map(subscriptions) });
  },

  disconnectBalanceStream: (chainType, address) => {
    const key = `${chainType}:${address}`;
    const { subscriptions } = get();

    const unsubscribe = subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      subscriptions.delete(key);
      set({ subscriptions: new Map(subscriptions) });
    }
  },

  disconnectAllStreams: () => {
    const { subscriptions } = get();

    subscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });

    subscriptions.clear();
    set({ subscriptions: new Map() });

    balanceSSEService.unsubscribeAll();
  },

  clearBalances: () => {
    get().disconnectAllStreams();

    set({
      balances: {},
      balanceFetched: false,
    });
  },
}));
