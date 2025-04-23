import { Typography } from "@gardenfi/garden-book";
import transactionHistoryStore from "../../store/transactionHistoryStore";
import { TransactionsSkeleton } from "./TransactionsSkeleton";
import { TransactionRow } from "./TransactionRow";
import { OrderStatus } from "@gardenfi/core";

export const CompletedTransactions = () => {
  const { transactions, isLoading } = transactionHistoryStore();

  return (
    <div className="flex w-full flex-col overflow-y-auto">
      {isLoading ? (
        <TransactionsSkeleton />
      ) : transactions.length === 0 ? (
        <Typography size="h5" className="pb-2 text-center">
          No transactions found.
        </Typography>
      ) : (
        transactions.map((order, index) => (
          <div key={index} className="w-full">
            <TransactionRow
              order={order}
              status={OrderStatus.Completed}
              isLast={index === transactions.length - 1}
            />
            {index !== transactions.length - 1 ? (
              <div className="h-px w-full bg-white/50"></div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};
