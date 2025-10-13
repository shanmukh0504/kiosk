import { OrderWithStatus } from "@gardenfi/core";
import { OrderStatus } from "@gardenfi/orderbook";

export const priorityList: Partial<Record<OrderStatus, number>> = {
  [OrderStatus.Created]: 1,
  [OrderStatus.InitiateDetected]: 2,
  [OrderStatus.Initiated]: 3,
  [OrderStatus.AwaitingRedeem]: 4,
  [OrderStatus.RedeemDetected]: 5,
  [OrderStatus.Redeemed]: 6,
};

export const getLatestUpdatedOrder = (
  newOrder: OrderWithStatus,
  oldOrder: OrderWithStatus
) => {
  const newOrderPriority = priorityList[newOrder.status];
  const oldOrderPriority = priorityList[oldOrder.status];

  if (!newOrderPriority || !oldOrderPriority) {
    return newOrder;
  }

  return newOrderPriority >= oldOrderPriority ? newOrder : oldOrder;
};

export const getLatestUpdatedOrders = (
  newOrders: OrderWithStatus[],
  oldOrders: OrderWithStatus[]
) => {
  return newOrders.map((newOrder) =>
    getLatestUpdatedOrder(
      newOrder,
      oldOrders.find((o) => o.order_id === newOrder.order_id) ?? newOrder
    )
  );
};
