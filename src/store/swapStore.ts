import { create } from "zustand";
import { IOType, network, QuoteError } from "../constants/constants";
import { Asset, Chains } from "@gardenfi/orderbook";

export type TokenPrices = {
  input: string;
  output: string;
};

export type FetchingQuote = {
  input: boolean;
  output: boolean;
};

export type Test = 
| `Minimum amount is ${string} ${string}` 
| `Maximum amount is ${string} ${string}` 
| "Output amount too high" 
| "Output amount too less"
| "";

export const Errors = {
  minError: (amount: string, asset: string): Test => `Minimum amount is ${amount} ${asset}`,
  maxError: (amount: string, asset: string): Test => `Maximum amount is ${amount} ${asset}`,
  outHigh: "Output amount too high" as const,
  outLow: "Output amount too less" as const,
  none: "" as const,
} as const;

export type SwapErrors = {
  inputError?: Test;
  outputError?: Test;
  quoteError?: QuoteError;
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
  error: SwapErrors;
  isFetchingQuote: FetchingQuote;
  isEditBTCAddress: boolean;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setStrategy: (strategy: string) => void;
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setError: (error: SwapErrors) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  setIsEditBTCAddress: (isEditBTCAddress: boolean) => void;
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
  inputAddressEditing: false,
  outputAddressEditing: false,
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
  error: {
    inputError: Errors.none,
    outputError: Errors.none,
    quoteError: QuoteError.None
  },
  isFetchingQuote: {
    input: false,
    output: false,
  },
  isEditBTCAddress: false,
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
  setIsSwapping: (isSwapping) => {
    set({ isSwapping });
  },
  setIsEditBTCAddress: (isEditBTCAddress) => {
    set({ isEditBTCAddress });
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
      error: {
        inputError: Errors.none,
        outputError: Errors.none,
        quoteError: QuoteError.None
      },
      isFetchingQuote: {
        input: false,
        output: false,
      },
      isEditBTCAddress: false,
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
      error: {
        inputError: Errors.none,
        outputError: Errors.none,
        quoteError: QuoteError.None
      },
      isFetchingQuote: {
        input: false,
        output: false,
      },
      isEditBTCAddress: false,
    });
  },
}));
