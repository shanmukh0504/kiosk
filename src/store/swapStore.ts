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

export type SwapErrors = {
  inputError?: string;
  outputError?: string;
  quoteError?: QuoteError;
};

type SwapState = {
  inputAsset?: Asset;
  outputAsset?: Asset;
  inputAmount: string;
  outputAmount: string;
  btcAddress: string;
  isSwapping: boolean;
  isAssetSwapping: boolean;
  inputEditing: boolean;
  outputEditing: boolean;
  strategy: string;
  tokenPrices: TokenPrices;
  error: SwapErrors;
  isFetchingQuote: FetchingQuote;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setIsAssetSwapping: (isAssetSwapping: boolean) => void;
  setStrategy: (strategy: string) => void;
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  setError: (error: SwapErrors) => void;
  swapAssets: () => void;
  setEditing: (ioType: IOType, editing: boolean) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
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
  inputEditing: false,
  outputEditing: false,
  swapInProgress: {
    isOpen: false,
    order: null,
  },
  isSwapping: false,
  isAssetSwapping: false,
  strategy: "",
  tokenPrices: {
    input: "0",
    output: "0",
  },
  error: {
    inputError: "",
    outputError: "",
    quoteError: QuoteError.None
  },
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
  setBtcAddress: (btcAddress) => {
    set((state) => ({
      ...state,
      btcAddress,
    }));
  },
  setIsSwapping: (isSwapping) => {
    set({ isSwapping });
  },
  setIsAssetSwapping: (isSwapping) => {
    set({ isSwapping });
  },
  setError: (error) => {
    set({ error });
  },
  setStrategy: (strategy) => {
    set({ strategy });
  },
  setTokenPrices: (tokenPrices) => {
    set({ tokenPrices });
  },
  setEditing: (ioType, edit) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputEditing" : "outputEditing"]: edit,
    }));
  },
  setIsFetchingQuote: (isFetchingQuote) => {
    set({ isFetchingQuote });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      inputEditing: false,
      outputEditing: false,
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      error: {
        inputError: "",
        outputError: "",
        quoteError: QuoteError.None
      },
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
      inputEditing: false,
      outputEditing: false,
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      isAssetSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      error: {
        inputError: "",
        outputError: "",
        quoteError: QuoteError.None
      },
      isFetchingQuote: {
        input: false,
        output: false,
      },
    });
  },
}));
