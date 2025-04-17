import { Typography } from "@gardenfi/garden-book";
import { useGarden } from "@gardenfi/react-hooks";
import { TransactionRow } from "./TransactionRow";

export const PendingTransactions = () => {
  const { pendingOrders } = useGarden();

  return (
    <div className="flex w-full flex-col overflow-y-auto">
      {pendingOrders && pendingOrders.length === 0 ? (
        <Typography size="h5" className="pb-2 text-center">
          No transactions found.
        </Typography>
      ) : (
        pendingOrders.map((order, index) => (
          <div key={index} className="w-full">
            <TransactionRow
              order={order}
              status={order.status}
              isLast={index === pendingOrders.length - 1}
            />
            {index !== pendingOrders.length - 1 ? (
              <div className="h-px w-full bg-white/50"></div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};
