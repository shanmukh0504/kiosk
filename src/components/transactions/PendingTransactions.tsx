import { Typography } from "@gardenfi/garden-book";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { TransactionRow } from "./TransactionRow";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderStatus, OrderWithStatus } from "@gardenfi/core";
import { isEVM } from "@gardenfi/orderbook";

export const PendingTransactions = () => {
  const { pendingOrders, updateOrder } = pendingOrdersStore();
  const { garden } = useGarden();

  const handlePendingTransactionsClick = async (order: OrderWithStatus) => {
    if (!garden || !garden.evmHTLC) return;
    if (!isEVM(order.source_swap.chain)) return;
    if (order.status !== OrderStatus.Matched) return;

    const tx = await garden.evmHTLC.initiate(order);
    if (!tx.ok) {
      console.error(tx.error);
      return;
    }
    console.log(tx.val);

    const updatedOrder = {
      ...order,
      source_swap: {
        ...order.source_swap,
        initiate_tx_hash: tx.val ?? "",
      },
      status: OrderStatus.InitiateDetected,
    };

    updateOrder({ ...updatedOrder });
  };

  return (
    <div className="flex w-full flex-col overflow-y-auto">
      {pendingOrders && pendingOrders.length === 0 ? (
        <Typography size="h5" className="pb-4 text-center">
          No transactions found.
        </Typography>
      ) : (
        pendingOrders.map((order, index) => (
          <div key={index} className="w-full">
            <TransactionRow
              order={order}
              status={order.status}
              isLast={index === pendingOrders.length - 1}
              isFirst={index === 0}
              onClick={() => handlePendingTransactionsClick(order)}
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
