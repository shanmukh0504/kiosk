import { BlockchainType, IOrderbook, MatchedOrder } from "@gardenfi/orderbook";
import { create } from "zustand";

type TransactionHistoryStoreState = {
  transactions: MatchedOrder[];
  isLoading: boolean;
  perPage: number;
  totalItems: number;
  fetchTransactions: (
    orderBook: IOrderbook,
    connectedWallets: {
      [key in BlockchainType]: string;
    }
  ) => Promise<void>;
  loadMore: (
    orderBook: IOrderbook,
    connectedWallets: {
      [key in BlockchainType]: string;
    }
  ) => Promise<void>;
};

const transactionHistoryStore = create<TransactionHistoryStoreState>(
  (set, get) => ({
    transactions: [],
    isLoading: false,
    perPage: 4,
    totalItems: 0,

    fetchTransactions: async (
      orderBook: IOrderbook,
      connectedWallets: {
        [key in BlockchainType]: string;
      }
    ) => {
      set({ isLoading: true });
      const transactions: MatchedOrder[] = [];
      let totalItems = 0;

      for (const [, address] of Object.entries(connectedWallets)) {
        if (address === "") continue;
        const txns = await orderBook.getMatchedOrders(address, "fulfilled", {
          per_page: get().perPage,
        });
        if (txns.error) {
          console.error(txns.error);
          continue;
        }
        totalItems += txns.val.total_items;
        transactions.push(...txns.val.data);
      }

      //sort by time, newest first
      transactions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      set({ transactions, isLoading: false, totalItems });
    },

    loadMore: async (
      orderBook: IOrderbook,
      connectedWallets: {
        [key in BlockchainType]: string;
      }
    ) => {
      set((state) => ({ perPage: state.perPage + 4 }));
      get().fetchTransactions(orderBook, connectedWallets);
    },
  })
);

export default transactionHistoryStore;
