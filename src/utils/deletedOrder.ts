import { OrderStatus, OrderWithStatus } from "@gardenfi/core";
import { LOCAL_STORAGE_KEYS } from "../constants/constants";

type DeletedOrderEntry = {
  order: OrderWithStatus;
  deletedAt: number;
};

export const addDeletedOrder = (order: OrderWithStatus): void => {
  const currentTime = Date.now();
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.deletedOrders);
  const deletedOrders: DeletedOrderEntry[] = storedData
    ? JSON.parse(storedData)
    : [];

  deletedOrders.push({
    order: order,
    deletedAt: currentTime,
  });

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.deletedOrders,
    JSON.stringify(deletedOrders)
  );
};

export const isOrderDeleted = (orderId: string): boolean => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.deletedOrders);
  if (!storedData) return false;

  const deletedOrders: DeletedOrderEntry[] = JSON.parse(storedData);
  return deletedOrders.some(
    (entry) => entry.order.create_order.create_id === orderId
  );
};

export const cleanupDeletedOrders = (
  pendingOrders: OrderWithStatus[]
): void => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.deletedOrders);
  if (!storedData) return;
  const deletedOrders: DeletedOrderEntry[] = JSON.parse(storedData);
  const pendingOrdersMap = new Map(
    pendingOrders.map((order) => [order.create_order.create_id, order])
  );
  const validDeletedOrders = deletedOrders.filter((entry) => {
    const orderId = entry.order.create_order.create_id;
    const orderInPending = pendingOrdersMap.get(orderId);
    return orderInPending && orderInPending.status === OrderStatus.Matched;
  });
  if (validDeletedOrders.length === 0) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.deletedOrders);
  } else {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.deletedOrders,
      JSON.stringify(validDeletedOrders)
    );
  }
};

