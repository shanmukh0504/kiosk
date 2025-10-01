import { BlockchainType, Order, PaginatedData } from "@gardenfi/orderbook";
import { create } from "zustand";
import logger from "../utils/logger";
import { APIResponse, Fetcher } from "@gardenfi/utils";

export const ConstructOrdersUrl = (
  baseUrl: string,
  params?: {
    [key: string]: string | number | boolean | undefined;
  }
): URL => {
  const url = new URL("/orders/matched", baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  return url;
};

type TransactionHistoryStoreState = {
  transactions: Order[];
  isLoading: boolean;
  perPage: number;
  totalItems: number;
  fetchTransactions: (
    orderbookUrl: string,
    connectedWallets: {
      [key in BlockchainType]: string;
    },
    append?: boolean
  ) => Promise<void>;
  loadMore: (
    orderbookUrl: string,
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
      orderbookUrl: string,
      connectedWallets: {
        [key in BlockchainType]: string;
      }
    ) => {
      set({ isLoading: true });
      try {
        const perPage = get().perPage;
        const addresses = Object.values(connectedWallets).filter(
          (addr) => addr !== ""
        );
        const urls = addresses.map((address) =>
          ConstructOrdersUrl(orderbookUrl, {
            address,
            per_page: perPage,
            status: "fulfilled",
          })
        );
        const fetchPromises = urls.map((url) =>
          Fetcher.get<APIResponse<PaginatedData<Order>>>(url)
        );

        const results = await Promise.all(fetchPromises);

        const newTransactions: Order[] = [];
        let totalItems = 0;
        const seenOrderIds = new Set<string>();

        for (const txns of results) {
          if (txns.error) {
            logger.error("failed to fetch transactions ❌", txns.error);
            continue;
          }
          totalItems += txns.result?.total_items ?? 0;
          for (const order of txns.result?.data ?? []) {
            const uniqueId =
              order.create_order.create_id ??
              order.create_order.create_id ??
              JSON.stringify(order);
            if (!seenOrderIds.has(uniqueId)) {
              seenOrderIds.add(uniqueId);
              newTransactions.push(order);
            }
          }
        }

        newTransactions.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        set({
          transactions: newTransactions,
          totalItems,
        });
      } catch (err) {
        logger.error("Unexpected error in fetchTransactions", err);
      } finally {
        set({ isLoading: false });
      }
    },

    loadMore: async (
      orderbookUrl: string,
      connectedWallets: {
        [key in BlockchainType]: string;
      }
    ) => {
      set((state) => ({ perPage: state.perPage + 4 }));
      await get().fetchTransactions(orderbookUrl, connectedWallets);
    },
  })
);

export default transactionHistoryStore;
