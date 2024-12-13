import { create } from "zustand";
import { IOType, network } from "../constants/constants";
import { Asset, Chains, MatchedOrder } from "@gardenfi/orderbook";

export type TokenPrices = {
  input: string;
  output: string;
};

export type FetchingQuote = {
  input: boolean;
  output: boolean;
};

type SwapState = {
  inputAsset?: Asset;
  outputAsset?: Asset;
  inputAmount: string;
  outputAmount: string;
  btcAddress: string;
  swapInProgress: { isOpen: boolean; order: MatchedOrder | null };
  isSwapping: boolean;
  strategy: string;
  tokenPrices: TokenPrices;
  error: string;
  isFetchingQuote: FetchingQuote;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setStrategy: (strategy: string) => void;
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setSwapInProgress: (confirmSwap: {
    isOpen: boolean;
    order: MatchedOrder;
  }) => void;
  setError: (error: string) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  closeSwapInProgress: () => void;
  clearSwapState: () => void;
};

const BTC = {
  name: "Bitcoin",
  decimals: 8,
  symbol: "BTC",
  logo: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  tokenAddress: "primary",
  atomicSwapAddress: "primary",
  chain: network === "mainnet" ? Chains.bitcoin : Chains.bitcoin_testnet,
};

export const swapStore = create<SwapState>((set) => ({
  inputAsset: BTC,
  inputAmount: "",
  outputAmount: "",
  btcAddress: "",
  swapInProgress: {
    isOpen: false,
    order: null,
  },
  isSwapping: false,
  strategy: "",
  tokenPrices: {
    input: "0",
    output: "0",
  },
  error: "",
  isFetchingQuote: {
    input: false,
    output: false,
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
    set((state) => {
      const newInputAmount =
        !state.outputAmount || state.outputAmount === "0"
          ? ""
          : state.outputAmount;

      const newOutputAmount =
        !state.inputAmount || state.inputAmount === "0"
          ? ""
          : state.outputAmount;
      return {
        ...state,
        inputAsset: state.outputAsset,
        outputAsset: state.inputAsset,
        inputAmount: newInputAmount,
        outputAmount: newOutputAmount,
      };
    });
  },
  setSwapInProgress: (swapInProgress) => {
    set(
      (state) =>
        (state = {
          ...state,
          swapInProgress,
        })
    );
  },
  setIsSwapping: (isSwapping) => {
    set({ isSwapping });
  },
  setStrategy: (strategy) => {
    set({ strategy });
  },
  setTokenPrices: (tokenPrices) => {
    set({ tokenPrices });
  },
  setError: (error) => {
    set({ error });
  },
  setIsFetchingQuote: (isFetchingQuote) => {
    set({ isFetchingQuote });
  },
  closeSwapInProgress: () => {
    set({ swapInProgress: { isOpen: false, order: null } });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      swapInProgress: { isOpen: false, order: null },
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      error: "",
      isFetchingQuote: {
        input: false,
        output: false,
      },
    });
  },
}));
