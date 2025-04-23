import { OrderWithStatus } from "@gardenfi/core";
import { create } from "zustand";

type OrderInProgressStoreState = {
  order: OrderWithStatus | null;
  isOpen: boolean;
  setOrder: (order: OrderWithStatus) => void;
  setIsOpen: (isOpen: boolean) => void;
};

const orderInProgressStore = create<OrderInProgressStoreState>((set) => ({
  order: null,
  isOpen: false,
  setOrder: (order) => {
    set({ order });
  },
  setIsOpen: (isOpen) => {
    set({ isOpen });
  },
}));

export default orderInProgressStore;
