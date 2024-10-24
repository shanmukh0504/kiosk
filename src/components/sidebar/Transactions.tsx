import { Typography } from "@gardenfi/garden-book";
import { Transaction } from "./Transaction";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect } from "react";
import { PaginationConfig } from "@gardenfi/orderbook";
import { useOrdersStore } from "../../store/ordersStore";
import { Button } from "@gardenfi/garden-book";

export const Transactions = () => {
  const { orderBook } = useGarden();
  const { 
    orders, 
    perPage, 
    totalItems,
    isLoading,
    setOrders, 
    setTotalItems, 
    incrementPerPage,
    setIsLoading 
  } = useOrdersStore();

  const fetchOrders = async () => {
    if (!orderBook) return;
    
    setIsLoading(true);
    const paginationConfig = {
      page: 1,
      per_page: perPage
    } as PaginationConfig;

    orderBook.subscribeOrders(
      "0xd53D4f100AaBA314bF033f99f86a312BfbdDF113",
      true,
      100000,
      async (fetchedOrders) => {
        setOrders(fetchedOrders.data);
        setTotalItems(fetchedOrders.total_items);
        setIsLoading(false);
      },
      false,
      paginationConfig
    );
  };

  useEffect(() => {
    fetchOrders();
  }, [orderBook, perPage]);

  const handleLoadMore = () => {
    incrementPerPage();
  };

  const showLoadMore = orders.length < totalItems;

  return (
    <>
        <div className="flex flex-col bg-white/50 rounded-2xl p-4 gap-4">
        <Typography size="h5" weight="bold">
            Transactions
        </Typography>
        <div className="flex flex-col gap-4">
            {orders.map((order, index) => (
            <div key={index}>
                <Transaction order={order} />
                <div className="bg-white/50 w-full mt-4 h-[1px]"></div>
            </div>
            ))}
            
            {isLoading && (
            <div className="text-center py-2">
                Loading...
            </div>
            )}
            
        </div>
        </div>
        <div className="flex justify-center">
            {showLoadMore && !isLoading && (
            <Button
                onClick={handleLoadMore}
                variant="secondary"
                className="w-1/4"
            >
                Load More
            </Button>
            )}
        </div>
    </>
  );
};
