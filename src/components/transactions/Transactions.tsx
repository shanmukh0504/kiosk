import { Typography } from "@gardenfi/garden-book";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, FC, useState, useMemo } from "react";
import { Button } from "@gardenfi/garden-book";
import { MatchedOrder } from "@gardenfi/orderbook";
import { ParseOrderStatus } from "@gardenfi/core";
import { blockNumberStore } from "../../store/blockNumberStore";
import { TransactionRow } from "./TransactionRow";
import { TransactionsSkeleton } from "./TransactionsSkeleton";
import { ordersStore } from "../../store/ordersStore";
import { useEVMWallet } from "../../hooks/useEVMWallet";

type TransactionsProps = {
  isOpen: boolean;
};

export const Transactions: FC<TransactionsProps> = ({ isOpen }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const { orderBook } = useGarden();
  const { address } = useEVMWallet();
  const { orders, fetchAndSetOrders, totalItems, loadMore } =
    ordersStore().ordersHistory;
  const { fetchAndSetBlockNumbers, blockNumbers } = blockNumberStore();

  const showLoadMore = useMemo(
    () => orders.length < totalItems,
    [orders.length, totalItems]
  );

  const handleLoadMore = async () => {
    if (!orderBook || !address) return;
    setIsLoadingMore(true);
    await loadMore(orderBook, address);
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
    if (!orderBook || !address || !isOpen) return;

    let isFetching = false;

    const fetchOrdersAndBlockNumbers = async () => {
      if (isFetching) return; // Skip if previous fetch hasn't completed

      try {
        isFetching = true;
        await fetchAndSetBlockNumbers();
        await fetchAndSetOrders(orderBook, address);
      } finally {
        isFetching = false;
      }
    };

    setIsLoadingOrders(true);
    fetchOrdersAndBlockNumbers().then(() => setIsLoadingOrders(false));
    const intervalId = setInterval(fetchOrdersAndBlockNumbers, 10000);

    return () => clearInterval(intervalId);
  }, [orderBook, isOpen, fetchAndSetOrders, fetchAndSetBlockNumbers, address]);

  return (
    <>
      <div className="scrollbar-hide flex flex-col gap-5 overflow-y-auto rounded-2xl pb-6">
        <div className="flex flex-col rounded-2xl bg-white/50">
          <Typography size="h5" weight="bold" className="p-4">
            Transactions
          </Typography>
          <div className="flex w-full flex-col overflow-y-auto">
            {isLoadingOrders ? (
              <TransactionsSkeleton />
            ) : orders.length === 0 ? (
              <Typography size="h5" className="pb-2 text-center">
                No transactions found.
              </Typography>
            ) : (
              orders.map((order, index) => (
                <div key={index} className="w-full">
                  <TransactionRow
                    order={order}
                    status={parseStatus(order)}
                    isLast={index === orders.length - 1}
                  />
                  {index !== orders.length - 1 ? (
                    <div className="h-px w-full bg-white/50"></div>
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
            className="mx-auto min-h-10 w-1/4"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </>
  );
};
