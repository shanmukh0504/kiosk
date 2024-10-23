import { create } from "zustand";
import { IOType } from "../constants/constants";
import { Asset, MatchedOrder } from "@gardenfi/orderbook";

type SwapState = {
  inputAsset?: Asset;
  outputAsset?: Asset;
  inputAmount: string;
  outputAmount: string;
  btcAddress: string;
  confirmSwap: { isOpen: boolean; order: MatchedOrder | null };
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setShowConfirmSwap: (confirmSwap: {
    isOpen: boolean;
    order: MatchedOrder;
  }) => void;
  clearOrder: () => void;
  clearAmounts: () => void;
};

export const swapStore = create<SwapState>((set) => ({
  inputAmount: "",
  outputAmount: "",
  btcAddress: "",
  confirmSwap: {
    isOpen: false,
    order: null,
  },
  setAsset: (ioType, asset) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAsset" : "outputAsset"]: asset,
    }));
  },
  setAmount: (ioType, amount) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAmount" : "outputAmount"]: amount,
    }));
  },
  setBtcAddress: (btcAddress) => {
    set((state) => ({
      ...state,
      btcAddress,
    }));
  },
  swapAssets: () => {
    set((state) => ({
      ...state,
      inputAsset: state.outputAsset,
      outputAsset: state.inputAsset,
      inputAmount: state.outputAmount,
      outputAmount: state.inputAmount,
    }));
  },
  setShowConfirmSwap: (confirmSwap) => {
    set(
      (state) =>
        (state = {
          ...state,
          confirmSwap,
        }),
    );
  },
  clearOrder: () => {
    set({ confirmSwap: { isOpen: false, order: null } });
  },
  clearAmounts: () => {
    set({ inputAmount: "", outputAmount: "" });
  },
}));
