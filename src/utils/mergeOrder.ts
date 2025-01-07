import { MatchedOrder } from "@gardenfi/orderbook";

export const mergeOrders = (
  currentOrder: MatchedOrder,
  updatedOrder: MatchedOrder
): MatchedOrder => {
  if (!currentOrder) return updatedOrder;
  if (
    currentOrder.create_order.create_id !== updatedOrder.create_order.create_id
  )
    return updatedOrder;
  return updatedOrder;
};
