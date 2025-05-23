import { create } from "zustand";
import { IOType, network } from "../constants/constants";
import { Asset, Chains } from "@gardenfi/orderbook";
import { ErrorFormat, Errors } from "../constants/errors";

export type TokenPrices = {
  input: string;
  output: string;
};

export type FetchingQuote = {
  input: boolean;
  output: boolean;
};

export type SwapErrors = {
  inputError?: ErrorFormat;
  outputError?: ErrorFormat;
  liquidityError?: ErrorFormat;
  insufficientBalanceError?: ErrorFormat;
};

type SwapState = {
  inputAsset?: Asset;
  outputAsset?: Asset;
  inputAmount: string;
  outputAmount: string;
  btcAddress: string;
  isSwapping: boolean;
  isApproving: boolean;
  strategy: string;
  tokenPrices: TokenPrices;
  error: SwapErrors;
  isFetchingQuote: FetchingQuote;
  isEditBTCAddress: boolean;
  isComparisonVisible: boolean;
  isValidBitcoinAddress: boolean;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setIsApproving: (isApproving: boolean) => void;
  setStrategy: (strategy: string) => void;
  setAsset: (ioType: IOType, asset: Asset | undefined) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setError: (error: SwapErrors) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  setIsEditBTCAddress: (isEditBTCAddress: boolean) => void;
  setIsComparisonVisible: (isComparisonVisible: boolean) => void;
  setIsValidBitcoinAddress: (isValidBitcoinAddress: boolean) => void;
  clearSwapState: () => void;
  clear: () => void;
};

export const BTC = {
  name: "Bitcoin",
  decimals: 8,
  symbol: "BTC",
  logo: "https://garden.imgix.net/token-images/bitcoin.svg",
  tokenAddress: "primary",
  atomicSwapAddress: "primary",
  chain: network === "mainnet" ? Chains.bitcoin : Chains.bitcoin_testnet,
};

export const swapStore = create<SwapState>((set) => ({
  inputAsset: undefined,
  inputAmount: "",
  outputAmount: "",
  btcAddress: "",
  isApproving: false,
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
    liquidityError: Errors.none,
    insufficientBalanceError: Errors.none,
  },
  isFetchingQuote: {
    input: false,
    output: false,
  },
  isEditBTCAddress: false,
  isComparisonVisible: false,
  isValidBitcoinAddress: false,
  setAsset: (ioType, supportedAsset) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAsset" : "outputAsset"]: supportedAsset,
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
        error: {
          ...state.error,
          inputError: Errors.none,
          outputError: Errors.none,
          liquidityError: Errors.none,
          insufficientBalanceError: Errors.none,
        },
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
    set((state) => ({ error: { ...state.error, ...error } }));
  },
  setIsFetchingQuote: (isFetchingQuote) => {
    set({ isFetchingQuote });
  },
  setIsApproving: (isApproving) => {
    set({ isApproving });
  },
  setIsComparisonVisible: (isComparisonVisible) => {
    set({ isComparisonVisible });
  },
  setIsValidBitcoinAddress: (isValidBitcoinAddress) => {
    set({ isValidBitcoinAddress });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      outputAsset: undefined,
      inputAsset: undefined,
      isApproving: false,
      isSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      error: {
        inputError: Errors.none,
        outputError: Errors.none,
        liquidityError: Errors.none,
        insufficientBalanceError: Errors.none,
      },
      isFetchingQuote: {
        input: false,
        output: false,
      },
      isEditBTCAddress: false,
      isValidBitcoinAddress: false,
    });
  },
  clear: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      outputAsset: undefined,
      inputAsset: undefined,
      isSwapping: false,
      isApproving: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      error: {
        inputError: Errors.none,
        outputError: Errors.none,
        liquidityError: Errors.none,
        insufficientBalanceError: Errors.none,
      },
      isFetchingQuote: {
        input: false,
        output: false,
      },
      isEditBTCAddress: false,
      isValidBitcoinAddress: false,
    });
  },
}));
