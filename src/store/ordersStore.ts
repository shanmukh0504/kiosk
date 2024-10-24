import { create } from "zustand";
import { MatchedOrder } from "@gardenfi/orderbook";

type OrdersState = {
  orders: MatchedOrder[];
  page: number;
  perPage: number;
  hasMore: boolean;
  setOrders: (newOrders: MatchedOrder[]) => void;
  loadMoreOrders: (additionalOrders: MatchedOrder[]) => void;
  updateRecentOrders: (recentOrders: MatchedOrder[]) => void;
  incrementPage: () => void;
  setHasMore: (value: boolean) => void;
};

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  page: 1,
  perPage: 4,
  hasMore: true,
  setOrders: (newOrders) => set({ orders: newOrders }),
  loadMoreOrders: (additionalOrders) =>
    set((state) => {
      const existingIds = new Set(state.orders.map(order => order.create_order.create_id));
      const uniqueNewOrders = additionalOrders.filter(
        order => !existingIds.has(order.create_order.create_id)
      );
      return { orders: [...state.orders, ...uniqueNewOrders] };
    }),
  updateRecentOrders: (recentOrders) =>
    set((state) => {
      const existingOrders = [...state.orders];
      const recentOrderIds = new Set(recentOrders.map(order => order.create_order.create_id));
      
      // Remove any existing orders that are in the recent batch
      const oldOrders = existingOrders.filter(
        order => !recentOrderIds.has(order.create_order.create_id)
      );
      
      // Combine recent orders with existing orders
      return { 
        orders: [...recentOrders, ...oldOrders]
      };
    }),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  setHasMore: (value: boolean) => set({ hasMore: value }),
}));