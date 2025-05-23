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

export const cleanupExpiredOrders = (
  pendingOrders: OrderWithStatus[]
): void => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.deletedOrders);
  if (!storedData) return;
  const deletedOrders: DeletedOrderEntry[] = JSON.parse(storedData);
  const pendingOrdersMap = new Map(
    pendingOrders.map((order) => [order.create_order.create_id, order])
  );
  const validOrders = deletedOrders.filter((entry) => {
    const pendingOrder = pendingOrdersMap.get(
      entry.order.create_order.create_id
    );
    return pendingOrder && pendingOrder.status !== OrderStatus.Expired;
  });
  if (validOrders.length === 0) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.deletedOrders);
  } else {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.deletedOrders,
      JSON.stringify(validOrders)
    );
  }
};

export const restoreDeletedOrder = (orderId: string): void => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.deletedOrders);
  if (!storedData) return;

  const deletedOrders: DeletedOrderEntry[] = JSON.parse(storedData);
  const updatedOrders = deletedOrders.filter(
    (entry) => entry.order.create_order.create_id !== orderId
  );
  console.log("updatedOrders", updatedOrders);
  if (updatedOrders.length === 0) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.deletedOrders);
  } else {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.deletedOrders,
      JSON.stringify(updatedOrders)
    );
  }
};

export const deletedOrdersLength = () => {
  const storedDeletedOrders = localStorage.getItem(
    LOCAL_STORAGE_KEYS.deletedOrders
  );
  return storedDeletedOrders ? JSON.parse(storedDeletedOrders).length : 0;
};
