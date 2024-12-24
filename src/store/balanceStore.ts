import { Asset } from "@gardenfi/orderbook";
import { create } from "zustand";

type BalanceState = {
  balances: Record<string, number>;
  setBalance: (asset: Asset, balance: number) => void;
  getBalance: (asset: Asset) => number;
  clearBalances: () => void;
};

export const balanceStore = create<BalanceState>((set, get) => ({
  balances: {},
  setBalance: (asset, balance) =>
    set((state) => ({
      balances: {
        ...state.balances,
        [`${asset.chain}_${asset.tokenAddress.toLowerCase()}`]: balance,
      },
    })),
  getBalance: (asset) =>
    get().balances[`${asset.chain}_${asset.tokenAddress.toLowerCase()}`] || 0,
  clearBalances: () => set({ balances: {} }),
}));
