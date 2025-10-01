import { Order } from "@gardenfi/orderbook";

export const mergeOrders = (
  currentOrder: Order,
  updatedOrder: Order
): Order => {
  if (!currentOrder) return updatedOrder;
  if (currentOrder.order_id !== updatedOrder.order_id) return updatedOrder;
  return updatedOrder;
};
