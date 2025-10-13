import { Order } from "@gardenfi/orderbook";
import { create } from "zustand";

type SwapInProgressState = {
  isSwapInProgress: boolean;
  order: Order | null;
  setSwapInProgress: (isSwapInProgress: boolean, order?: Order) => void;
  setOrder: (order: Order) => void;
};

export const swapInProgressStore = create<SwapInProgressState>((set) => ({
  isSwapInProgress: false,
  order: null,
  setSwapInProgress: (isSwapInProgress, order) =>
    set({ isSwapInProgress, order }),
  setOrder: (order) => set({ order }),
}));
