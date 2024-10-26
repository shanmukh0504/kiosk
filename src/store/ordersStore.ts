import { create } from 'zustand';
import { MatchedOrder } from "@gardenfi/orderbook";

interface OrdersState {
  orders: MatchedOrder[];
  totalItems: number;
  perPage: number;
  isLoading: boolean;
  setOrders: (orders: MatchedOrder[]) => void;
  setTotalItems: (total: number) => void;
  incrementPerPage: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  totalItems: 0,
  perPage: 4,
  isLoading: false,
  setOrders: (orders) => set({ orders }),
  setTotalItems: (totalItems) => set({ totalItems }),
  incrementPerPage: () => set((state) => ({ perPage: state.perPage + 4 })),
  setIsLoading: (isLoading) => set({ isLoading })
}));