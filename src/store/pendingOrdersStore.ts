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
    const sorted = [...newOrders].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
    set({ pendingOrders: sorted });
  },
  updateOrder: (order) => {
    const pendingOrders = get().pendingOrders;
    const oldOrder = pendingOrders.find((o) => o.order_id === order.order_id);
    if (!oldOrder) return;
    const newOrder = getLatestUpdatedOrder(order, oldOrder);
    const updated = pendingOrders.map((o) =>
      o.order_id === order.order_id ? newOrder : o
    );
    const sorted = updated.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
    set({ pendingOrders: sorted });
  },
}));

export default pendingOrdersStore;
