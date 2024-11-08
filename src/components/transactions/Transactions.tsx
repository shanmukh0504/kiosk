import { Typography } from "@gardenfi/garden-book";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, FC, useState, useMemo } from "react";
import { Button } from "@gardenfi/garden-book";
import { MatchedOrder } from "@gardenfi/orderbook";
import { ParseOrderStatus } from "@gardenfi/core";
import { useOrdersStore } from "../../store/ordersStore";
import blockNumberStore from "../../store/blockNumberStore";
import { TransactionRow } from "./TransactionRow";

type TransactionsProps = {
  isOpen: boolean;
};

export const Transactions: FC<TransactionsProps> = ({ isOpen }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const { orderBook } = useGarden();
  const { orders, totalItems, fetchAndSetOrders, loadMore } = useOrdersStore();
  const { fetchAndSetBlockNumbers, blockNumbers } = blockNumberStore();

  const showLoadMore = useMemo(
    () => orders.length < totalItems,
    [orders.length, totalItems]
  );

  const handleLoadMore = async () => {
    if (!orderBook) return;
    setIsLoadingMore(true);
    await loadMore(orderBook);
    setIsLoadingMore(false);
  };

  const parseStatus = (order: MatchedOrder) => {
    if (!blockNumbers) return;
    const { source_swap, destination_swap } = order;
    const sourceBlockNumber = blockNumbers[source_swap.chain];
    const destinationBlockNumber = blockNumbers[destination_swap.chain];
    if (!sourceBlockNumber || !destinationBlockNumber) return;

    return ParseOrderStatus(order, sourceBlockNumber, destinationBlockNumber);
  };

  useEffect(() => {
    if (!orderBook || !isOpen) return;

    const fetchOrdersAndBlockNumbers = async () => {
      await fetchAndSetOrders(orderBook);
      await fetchAndSetBlockNumbers();
    };

    setIsLoadingOrders(true);
    fetchOrdersAndBlockNumbers().then(() => setIsLoadingOrders(false));
    const intervalId = setInterval(fetchOrdersAndBlockNumbers, 10000);

    return () => clearInterval(intervalId);
  }, [orderBook, isOpen, fetchAndSetOrders, fetchAndSetBlockNumbers]);

  return (
    <>
      <div className="overflow-y-auto pb-6 flex flex-col gap-5 scrollbar-hide rounded-2xl">
        <div className="flex flex-col bg-white/50 rounded-2xl p-4 gap-4 ">
          <Typography size="h5" weight="bold">
            Transactions
          </Typography>
          <div className="flex flex-col gap-4 overflow-auto">
            {isLoadingOrders ? (
              <div className="text-center py-2">Loading...</div>
            ) : (
              orders.map((order, index) => (
                <div key={index}>
                  <TransactionRow order={order} status={parseStatus(order)} />
                  {index !== orders.length - 1 ? (
                    <div className="bg-white/50 w-full h-px"></div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
        {showLoadMore && (
          <Button
            onClick={handleLoadMore}
            variant={isLoadingMore ? "disabled" : "secondary"}
            className="w-1/4 mx-auto min-h-10"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </>
  );
};
