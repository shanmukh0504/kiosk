import { Typography } from "@gardenfi/garden-book";
import transactionHistoryStore from "../../store/transactionHistoryStore";
import { TransactionsSkeleton } from "./TransactionsSkeleton";
import { TransactionRow } from "./TransactionRow";
import { OrderStatus } from "@gardenfi/orderbook";
import { useMemo } from "react";
import { getAssetFromSwap } from "../../utils/utils";
import { assetInfoStore } from "../../store/assetInfoStore";

export const CompletedTransactions = () => {
  const { transactions, isLoading } = transactionHistoryStore();
  const { allAssets } = assetInfoStore();

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (order) =>
          getAssetFromSwap(order.source_swap, allAssets) &&
          getAssetFromSwap(order.destination_swap, allAssets)
      ),
    [transactions, allAssets]
  );

  return (
    <div className="flex w-full flex-col overflow-y-auto">
      {isLoading ? (
        <TransactionsSkeleton />
      ) : filteredTransactions.length === 0 ? (
        <Typography size="h5" className="pb-4 text-center">
          No transactions found.
        </Typography>
      ) : (
        filteredTransactions.map((order, index) => (
          <div key={index} className="w-full">
            <TransactionRow
              order={order}
              status={OrderStatus.Refunded} // TODO
              isLast={index === filteredTransactions.length - 1}
              isFirst={index === 0}
            />
          </div>
        ))
      )}
    </div>
  );
};
