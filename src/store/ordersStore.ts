import { create } from "zustand";
import { MatchedOrder } from "@gardenfi/orderbook";

type OrdersState = {
  orders: MatchedOrder[];
  page: number;
  perPage: number;
  hasMore: boolean;
  setOrders: (newOrders: MatchedOrder[]) => void;
  loadMoreOrders: (additionalOrders: MatchedOrder[]) => void;
  incrementPage: () => void;
  setHasMore: (value: boolean) => void;
};

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  page: 1,
  perPage: 5,
  hasMore: true,
  setOrders: (newOrders) => set({ orders: newOrders }),
  loadMoreOrders: (additionalOrders) =>
    set((state) => ({ orders: [...state.orders, ...additionalOrders] })),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  setHasMore: (value: boolean) => set({ hasMore: value }),
}));
