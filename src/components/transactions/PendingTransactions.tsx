import { Typography } from "@gardenfi/garden-book";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { TransactionRow } from "./TransactionRow";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderWithStatus } from "@gardenfi/core";
import {
  isBitcoin,
  isEVM,
  isSolana,
  isSui,
  isStarknet,
  OrderStatus,
  isTron,
  isLitecoin,
  isAlpenSignet,
} from "@gardenfi/orderbook";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import logger from "../../utils/logger";

export const PendingTransactions = () => {
  const { pendingOrders, updateOrder } = pendingOrdersStore();
  const { garden } = useGarden();
  const { provider } = useBitcoinWallet();
  const { provider: ltcProvider } = useLitecoinWallet();

  const handlePendingTransactionsClick = async (order: OrderWithStatus) => {
    if (!garden) return;
    if (order.status !== OrderStatus.Created) return;
    let txHash;
    if (garden.htlcs.evm && isEVM(order.source_swap.chain)) {
      const tx = await garden.htlcs.evm.initiate(order);
      if (!tx.ok) {
        logger.error("failed to send evm ❌", tx.error);
        return;
      }
      txHash = tx.val;
    } else if (ltcProvider && isLitecoin(order.source_swap.chain)) {
      const ltcRes = await ltcProvider.sendLitecoin(
        order.source_swap.swap_id,
        Number(order.source_swap.amount)
      );
      if (!ltcRes.ok) {
        logger.error("failed to send bitcoin ❌", ltcRes.error);
        return;
      }
      txHash = ltcRes.val;
    } else if (
      provider &&
      isBitcoin(order.source_swap.chain) &&
      !isAlpenSignet(order.source_swap.chain)
    ) {
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
      if (!garden.htlcs.solana) {
        logger.error("Solana HTLC not available");
        return;
      }
      const tx = await garden.htlcs.solana.initiate(order);
      if (!tx.ok) {
        logger.error("failed to send solana ❌", tx.error);
        return;
      }
      txHash = tx.val;
    } else if (isSui(order.source_swap.chain)) {
      if (!garden.htlcs.sui) {
        console.error("Sui HTLC not available");
        return;
      }
      const tx = await garden.htlcs.sui.initiate(order);
      if (!tx.ok) {
        console.error(tx.error);
        return;
      }
      txHash = tx.val;
    } else if (isStarknet(order.source_swap.chain)) {
      if (!garden.htlcs.starknet) {
        console.error("Starknet HTLC not available");
        return;
      }
      const tx = await garden.htlcs.starknet.initiate(order);
      if (!tx.ok) {
        console.error(tx.error);
        return;
      }
      txHash = tx.val;
    } else if (isTron(order.source_swap.chain)) {
      if (!garden.htlcs.tron) {
        console.error("Tron HTLC not available");
        return;
      }
      const tx = await garden.htlcs.tron.initiate(order);
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
