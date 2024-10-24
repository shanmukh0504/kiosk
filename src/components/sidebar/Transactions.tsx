import { Typography, Button } from "@gardenfi/garden-book";
import { Transaction } from "./Transaction";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useCallback } from "react";
import { useOrdersStore } from "../../store/ordersStore";
import { PaginationConfig } from "@gardenfi/orderbook";

export const Transactions = () => {
  const { orderBook } = useGarden();
  const { orders, page, perPage, hasMore, setOrders, loadMoreOrders, incrementPage, setHasMore } = useOrdersStore();

  const fetchOrders = useCallback(async () => {
    const paginationConfig: PaginationConfig = {
      page,
      per_page: perPage,
    };
    
    orderBook?.subscribeOrders("0xd53D4f100AaBA314bF033f99f86a312BfbdDF113", true, 100000, async (fetchedOrders) => {
      const newOrders = fetchedOrders.data;

      if (newOrders.length > 0) {
        if (page === 1) {
          setOrders(newOrders);
        } else {
          loadMoreOrders(newOrders);
        }
        if (newOrders.length < perPage) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    }, false, paginationConfig);
  }, [orderBook, page, perPage, setOrders, loadMoreOrders, setHasMore]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleLoadMore = () => {
    incrementPage();
    fetchOrders();
  };

  return (
    <div className="flex flex-col bg-white/50 rounded-2xl p-4 gap-4 max-h-[80vh] overflow-y-auto">
      <Typography size="h5" weight="bold">
        Transactions
      </Typography>
      <div>
        {orders.map((order, index) => (
          <div key={index}>
            <Transaction order={order} />
            <div className="bg-white/50 w-full mb-4 h-[1px]"></div>
          </div>
        ))}
      </div>
      {hasMore && (
        <Button className="mt-4" onClick={handleLoadMore}>
          Load More
        </Button>
      )}
    </div>
  );
};
