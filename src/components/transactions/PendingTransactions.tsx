import { Typography } from "@gardenfi/garden-book";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { TransactionRow } from "./TransactionRow";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderStatus, OrderWithStatus } from "@gardenfi/core";
import {
  isBitcoin,
  isEVM,
  isSolana,
  isSui,
  isStarknet,
} from "@gardenfi/orderbook";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import logger from "../../utils/logger";

export const PendingTransactions = () => {
  const { pendingOrders, updateOrder } = pendingOrdersStore();
  const { garden } = useGarden();
  const { provider } = useBitcoinWallet();

  const handlePendingTransactionsClick = async (order: OrderWithStatus) => {
    if (!garden || !garden.evmHTLC) return;
    if (order.status !== OrderStatus.Matched) return;
    let txHash;
    if (isEVM(order.source_swap.chain)) {
      const tx = await garden.evmHTLC.initiate(order);
      if (!tx.ok) {
        logger.error("failed to send evm ❌", tx.error);
        return;
      }
      txHash = tx.val;
    } else if (provider && isBitcoin(order.source_swap.chain)) {
      const bitcoinRes = await provider.sendBitcoin(
        order.source_swap.swap_id,
        Number(order.source_swap.amount)
      );
      if (bitcoinRes.error) {
        logger.error("failed to send bitcoin ❌", bitcoinRes.error);
        return;
      }
      txHash = bitcoinRes.val;
    } else if (isSolana(order.source_swap.chain)) {
      if (!garden.solanaHTLC) {
        logger.error("Solana HTLC not available");
        return;
      }
      const tx = await garden.solanaHTLC.initiate(order);
      if (!tx.ok) {
        logger.error("failed to send solana ❌", tx.error);
        return;
      }
      txHash = tx.val;
    } else if (isSui(order.source_swap.chain)) {
      if (!garden.suiHTLC) {
        console.error("Sui HTLC not available");
        return;
      }
      const tx = await garden.suiHTLC.initiate(order);
      if (!tx.ok) {
        console.error(tx.error);
        return;
      }
      txHash = tx.val;
    } else if (isStarknet(order.source_swap.chain)) {
      if (!garden.starknetHTLC) {
        console.error("Starknet HTLC not available");
        return;
      }
      const tx = await garden.starknetHTLC.initiate(order);
      if (!tx.ok) {
        console.error(tx.error);
        return;
      }
      txHash = tx.val;
    }
    logger.log("txHash : ", txHash);
    if (!txHash) return;

    const updatedOrder = {
      ...order,
      source_swap: {
        ...order.source_swap,
        initiate_tx_hash: txHash ?? "",
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
