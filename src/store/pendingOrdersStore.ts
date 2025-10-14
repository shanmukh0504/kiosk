import { OrderWithStatus } from "@gardenfi/core";
import { create } from "zustand";
import { getLatestUpdatedOrder } from "../utils/getLatestUpdatedOrder";

type PendingOrdersStoreState = {
  pendingOrders: OrderWithStatus[];
  setPendingOrders: (pendingOrders: OrderWithStatus[]) => void;
  updateOrder: (order: OrderWithStatus) => void;
};

const pendingOrdersStore = create<PendingOrdersStoreState>((set, get) => ({
  pendingOrders: [],
  setPendingOrders: (pendingOrders) => {
    const existingOrders = get().pendingOrders;
    const newOrders = pendingOrders.map((o) => {
      const order = existingOrders.find((o2) => o2.order_id === o.order_id);
      if (!order) return o;
      return getLatestUpdatedOrder(o, order);
    });
    set({ pendingOrders: [...newOrders] });
  },
  updateOrder: (order) => {
    const pendingOrders = get().pendingOrders;
    const oldOrder = pendingOrders.find((o) => o.order_id === order.order_id);
    if (!oldOrder) return;
    const newOrder = getLatestUpdatedOrder(order, oldOrder);
    set({
      pendingOrders: pendingOrders.map((o) =>
        o.order_id === order.order_id ? newOrder : o
      ),
    });
  },
}));

export default pendingOrdersStore;
