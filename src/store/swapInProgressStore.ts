import { MatchedOrder } from "@gardenfi/orderbook";
import { create } from "zustand";

type SwapInProgressState = {
  isSwapInProgress: boolean;
  order: MatchedOrder | null;
  setSwapInProgress: (isSwapInProgress: boolean, order?: MatchedOrder) => void;
  setOrder: (order: MatchedOrder) => void;
};

export const swapInProgressStore = create<SwapInProgressState>((set) => ({
  isSwapInProgress: false,
  order: null,
  setSwapInProgress: (isSwapInProgress, order) =>
    set({ isSwapInProgress, order }),
  setOrder: (order) => set({ order }),
}));
