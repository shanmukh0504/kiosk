import { Typography } from "@gardenfi/garden-book";
import transactionHistoryStore from "../../store/transactionHistoryStore";
import { TransactionsSkeleton } from "./TransactionsSkeleton";
import { TransactionRow } from "./TransactionRow";
import { ParseOrderStatus } from "@gardenfi/orderbook";
import { useMemo } from "react";
import { getAssetFromSwap } from "../../utils/utils";
import { assetInfoStore } from "../../store/assetInfoStore";

export const CompletedTransactions = () => {
  const { transactions, isLoading } = transactionHistoryStore();
  const { assets } = assetInfoStore();

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (order) =>
          getAssetFromSwap(order.source_swap, assets) &&
          getAssetFromSwap(order.destination_swap, assets)
      ),
    [transactions, assets]
  );

  return (
    <div
      className="flex w-full flex-col overflow-y-auto"
      data-testid="transactions-completed-list"
    >
      {isLoading ? (
        <TransactionsSkeleton />
      ) : filteredTransactions.length === 0 ? (
        <Typography size="h5" className="pb-4 text-center">
          No transactions found.
        </Typography>
      ) : (
        filteredTransactions.map((order, index) => {
          const parsedStatus = ParseOrderStatus(order);
          return (
            <div key={index} className="w-full">
              <TransactionRow
                index={index}
                order={order}
                status={parsedStatus}
                isLast={index === filteredTransactions.length - 1}
                isFirst={index === 0}
              />
            </div>
          );
        })
      )}
    </div>
  );
};
