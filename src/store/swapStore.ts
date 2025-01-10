import { create } from "zustand";
import { IOType, network } from "../constants/constants";
import { Asset, Chains } from "@gardenfi/orderbook";

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
  isSwapping: boolean;
  strategy: string;
  tokenPrices: TokenPrices;
  inputError: string,
  outputError: string,
  isFetchingQuote: FetchingQuote;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setStrategy: (strategy: string) => void;
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  setError: (ioType: IOType, error: string) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  swapAssetsAndAmounts: () => void;
  clearSwapState: () => void;
  clear: () => void;
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
  inputError: "",
  outputError: "",
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
  setIsSwapping: (isSwapping) => {
    set({ isSwapping });
  },
  setStrategy: (strategy) => {
    set({ strategy });
  },
  setTokenPrices: (tokenPrices) => {
    set({ tokenPrices });
  },
  setError: (ioType, error) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputError" : "outputError"]: error,
    }));
  },
  setIsFetchingQuote: (isFetchingQuote) => {
    set({ isFetchingQuote });
  },
  swapAssetsAndAmounts: () => {
    set((state) => {
      if (!state.inputAsset || !state.outputAsset) {
        return state;
      }
      return {
        ...state,
        inputAsset: state.outputAsset,
        outputAsset: state.inputAsset,
        inputAmount: "",
        outputAmount: (state.inputAmount !== "" && state.inputAmount !== "0") ? state.inputAmount : "",
      };
    });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      inputError: "",
      outputError: "",
      isFetchingQuote: {
        input: false,
        output: false,
      },
    });
  },
  clear: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      inputError: "",
outputError: "",
      isFetchingQuote: {
        input: false,
        output: false,
      },
    });
  },
}));
