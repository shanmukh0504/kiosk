import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderStatus, OrderWithStatus } from "@gardenfi/core";

type DeletedOrderEntry = {
  order: OrderWithStatus;
  deletedAt: number;
};

type DeletedOrdersState = {
  deletedOrders: DeletedOrderEntry[];
  addDeletedOrder: (order: OrderWithStatus) => void;
  isOrderDeleted: (orderId: string) => boolean;
  cleanupDeletedOrders: (pendingOrders: OrderWithStatus[]) => void;
};

export const deletedOrdersStore = create<DeletedOrdersState>()(
  persist(
    (set, get) => ({
      deletedOrders: [],

      addDeletedOrder: (order: OrderWithStatus) => {
        const newEntry: DeletedOrderEntry = {
          order,
          deletedAt: Date.now(),
        };
        set((state) => ({
          deletedOrders: [...state.deletedOrders, newEntry],
        }));
      },

      isOrderDeleted: (orderId: string) => {
        return get().deletedOrders.some(
          (entry) => entry.order.create_order.create_id === orderId
        );
      },

      cleanupDeletedOrders: (pendingOrders: OrderWithStatus[]) => {
        const pendingOrdersMap = new Map(
          pendingOrders.map((order) => [order.create_order.create_id, order])
        );

        const validDeletedOrders = get().deletedOrders.filter((entry) => {
          const orderId = entry.order.create_order.create_id;
          const orderInPending = pendingOrdersMap.get(orderId);
          return (
            orderInPending && orderInPending.status === OrderStatus.Matched
          );
        });

        set({ deletedOrders: validDeletedOrders });
      },
    }),
    {
      name: "deleted-orders-storage",
    }
  )
);
