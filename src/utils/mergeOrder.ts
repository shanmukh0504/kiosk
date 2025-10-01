import { Order } from "@gardenfi/orderbook";

export const mergeOrders = (
  currentOrder: Order,
  updatedOrder: Order
): Order => {
  if (!currentOrder) return updatedOrder;
  if (
    currentOrder.create_order.create_id !== updatedOrder.create_order.create_id
  )
    return updatedOrder;
  return updatedOrder;
};
