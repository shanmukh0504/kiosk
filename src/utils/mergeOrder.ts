import { MatchedOrder } from "@gardenfi/orderbook";

export const mergeOrders = (
  currentOrder: MatchedOrder,
  updatedOrder: MatchedOrder
): MatchedOrder => {
  if (!currentOrder) return currentOrder;
  if (currentOrder.source_swap.initiate_tx_hash) {
    if (!updatedOrder.source_swap.initiate_tx_hash) return currentOrder;
  }
  if (currentOrder.destination_swap.redeem_tx_hash) {
    if (!updatedOrder.destination_swap.redeem_tx_hash) return currentOrder;
  }
  if (
    currentOrder.create_order.create_id !== updatedOrder.create_order.create_id
  )
    return updatedOrder;
  return updatedOrder;
};
