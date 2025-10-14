import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderWithStatus } from "@gardenfi/core";
import { OrderStatus } from "@gardenfi/orderbook";

type DeletedOrderEntry = {
  orderId: string;
  deletedAt: number;
};

type DeletedOrdersState = {
  deletedOrders: DeletedOrderEntry[];
  addDeletedOrder: (orderId: string) => void;
  isOrderDeleted: (orderId: string) => boolean;
  cleanupDeletedOrders: (pendingOrders: OrderWithStatus[]) => void;
};

export const deletedOrdersStore = create<DeletedOrdersState>()(
  persist(
    (set, get) => ({
      deletedOrders: [],

      addDeletedOrder: (orderId: string) => {
        const newEntry: DeletedOrderEntry = {
          orderId,
          deletedAt: Date.now(),
        };
        set((state) => ({
          deletedOrders: [...state.deletedOrders, newEntry],
        }));
      },

      isOrderDeleted: (orderId: string) => {
        return get().deletedOrders.some((entry) => entry.orderId === orderId);
      },

      cleanupDeletedOrders: (pendingOrders: OrderWithStatus[]) => {
        const pendingOrdersMap = new Map(
          pendingOrders.map((order) => [order.order_id, order])
        );

        const validDeletedOrders = get().deletedOrders.filter((entry) => {
          const orderId = entry.orderId;
          const orderInPending = pendingOrdersMap.get(orderId.toLowerCase());
          return (
            orderInPending && orderInPending.status === OrderStatus.Created
          );
        });

        set({ deletedOrders: validDeletedOrders });
      },
    }),
    {
      name: "deleted_orders",
    }
  )
);
