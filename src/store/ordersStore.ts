import { create } from "zustand";
import { IOrderbook, MatchedOrder } from "@gardenfi/orderbook";

interface OrdersState {
  orders: MatchedOrder[];
  totalItems: number;
  perPage: number;
  isFetching: boolean;
  error: string;
  fetchAndSetOrders: (orderBook: IOrderbook) => Promise<void>;
  loadMore: (orderBook: IOrderbook) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  totalItems: 0,
  perPage: 4,
  isFetching: false,
  error: "",
  fetchAndSetOrders: async (orderbook) => {
    const state = get();
    set({ isFetching: true });
    const res = await orderbook.fetchOrders(true, false, {
      per_page: state.perPage,
    });
    if (res.ok) {
      set({ orders: res.val.data, totalItems: res.val.total_items, error: "" });
    } else {
      set({ error: res.error });
    }
    set({ isFetching: false });
  },
  loadMore: async (orderbook) => {
    set((state) => ({ perPage: state.perPage + 4 }));
    await get().fetchAndSetOrders(orderbook);
  },
}));
