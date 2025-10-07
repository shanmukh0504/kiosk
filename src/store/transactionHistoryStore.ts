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
  const url = new URL("/v2/orders", baseUrl);
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
  fetchInFlight: Promise<void> | null;
  lastFetchCompletedAt: number;
  minFetchIntervalMs: number;
  hasLoadedOnce: boolean;
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
  resetTransactions: () => void;
};

const transactionHistoryStore = create<TransactionHistoryStoreState>(
  (set, get) => ({
    transactions: [],
    isLoading: false,
    fetchInFlight: null,
    lastFetchCompletedAt: 0,
    minFetchIntervalMs: 5000,
    hasLoadedOnce: false,
    perPage: 4,
    totalItems: 0,

    fetchTransactions: async (
      orderbookUrl: string,
      connectedWallets: {
        [key in BlockchainType]: string;
      },
      append?: boolean
    ) => {
      // If a request is already in-flight, share it
      const existing = get().fetchInFlight;
      if (existing) {
        await existing;
        return;
      }

      const run = (async () => {
        const now = Date.now();
        const sinceLast = now - get().lastFetchCompletedAt;
        const waitMs = append
          ? 0
          : Math.max(0, get().minFetchIntervalMs - sinceLast);
        if (waitMs > 0) {
          await new Promise((r) => setTimeout(r, waitMs));
        }

        // Only show loading skeleton for the very first load
        const showLoading = !get().hasLoadedOnce;
        if (showLoading) set({ isLoading: true });

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
              order.order_id ?? order.order_id ?? JSON.stringify(order);
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

        set({ transactions: newTransactions, totalItems });
      })()
        .catch((err) => {
          logger.error("Unexpected error in fetchTransactions", err);
        })
        .finally(() => {
          const update: Partial<TransactionHistoryStoreState> = {
            fetchInFlight: null,
            lastFetchCompletedAt: Date.now(),
            hasLoadedOnce: true,
          };
          // Only hide loading if it was shown in this run
          if (get().isLoading) update.isLoading = false;
          set(update as TransactionHistoryStoreState);
        });

      set({ fetchInFlight: run });
      await run;
    },

    loadMore: async (
      orderbookUrl: string,
      connectedWallets: {
        [key in BlockchainType]: string;
      }
    ) => {
      set((state) => ({ perPage: state.perPage + 4 }));
      await get().fetchTransactions(orderbookUrl, connectedWallets, true);
    },

    resetTransactions: () =>
      set({
        transactions: [],
        totalItems: 0,
        perPage: 4,
        hasLoadedOnce: false,
        lastFetchCompletedAt: 0,
      }),
  })
);

export default transactionHistoryStore;
