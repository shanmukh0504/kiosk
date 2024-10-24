import { Button, Typography } from "@gardenfi/garden-book";
import { Transaction } from "./Transaction";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useCallback, useRef } from "react";
import { PaginationConfig } from "@gardenfi/orderbook";
import { useOrdersStore } from "../../store/ordersStore";

export const Transactions = () => {
  const { orderBook } = useGarden();
  const { 
    orders, 
    page, 
    perPage, 
    hasMore, 
    setOrders, 
    loadMoreOrders, 
    updateRecentOrders,
    incrementPage, 
    setHasMore 
  } = useOrdersStore();
  
  const subscribedPages = useRef(new Set<number>());

  const fetchOrders = useCallback(async (currentPage: number, isPollingUpdate = false) => {
    const paginationConfig = {
      page: currentPage,
      per_page: perPage
    } as PaginationConfig;

    return new Promise<void>((resolve) => {
      orderBook?.subscribeOrders(
        "0xd53D4f100AaBA314bF033f99f86a312BfbdDF113",
        true,
        100000,
        async (fetchedOrders) => {
          console.log("firing now");
          if (isPollingUpdate) {
            // Only update the most recent page's data
            updateRecentOrders(fetchedOrders.data);
          } else {
            // Normal pagination load
            if (currentPage === 1) {
              setOrders(fetchedOrders.data);
            } else {
              loadMoreOrders(fetchedOrders.data);
            }
            setHasMore(fetchedOrders.data.length === perPage);
            subscribedPages.current.add(currentPage);
          }
          resolve();
        },
        false,
        paginationConfig
      );
    });
  }, [orderBook, perPage, setOrders, loadMoreOrders, updateRecentOrders, setHasMore]);

  // Initial fetch and polling updates
  useEffect(() => {
    // Initial load
    if (!subscribedPages.current.has(1)) {
      fetchOrders(1);
    }

    // Set up polling for the most recent data
    const pollingInterval = setInterval(() => {
      if (page > 0) {
        fetchOrders(1, true);
      }
    }, 10000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchOrders, page]);

  const handleLoadMore = async () => {
    if (!hasMore) return;
    incrementPage();
    await fetchOrders(page + 1);
  };

  return (
    <div className="flex flex-col bg-white/50 rounded-2xl p-4 gap-4">
      <Typography size="h5" weight="bold">
        Transactions
      </Typography>
      <div>
        {orders.map((order, index) => (
          <div key={order.create_order.create_id || index}>
            <Transaction order={order} />
            <div className="bg-white/50 w-full mb-4 h-[1px]"></div>
          </div>
        ))}
      </div>
      {hasMore && (
        <Button 
          variant="secondary" 
          onClick={handleLoadMore}
        >
          Load more
        </Button>
      )}
    </div>
  );
};