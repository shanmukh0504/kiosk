import { create } from "zustand";
import { Asset, ChainAsset, Chains } from "@gardenfi/orderbook";
import { IOType, network } from "../constants/constants";
import { ErrorFormat, Errors } from "../constants/errors";
import { assetInfoStore } from "./assetInfoStore";

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
  alpenAddress?: string;
  solverId: string;
  inputAmount: string;
  outputAmount: string;
  rate: number;
  networkFees: number;
  fixedFee: number;
  btcAddress: string;
  isSwapping: boolean;
  isApproving: boolean;
  tokenPrices: TokenPrices;
  fiatTokenPrices: TokenPrices;
  error: SwapErrors;
  isNetworkFeesLoading: boolean;
  isFetchingQuote: FetchingQuote;
  isEditBTCAddress: boolean;
  isComparisonVisible: boolean;
  isValidBitcoinAddress: boolean;
  showComparison: {
    isTime: boolean;
    isFees: boolean;
  };
  maxTimeSaved: number;
  maxCostSaved: number;
  setAlpenAddress: (alpenAddress: string) => void;
  setFiatTokenPrices: (fiatTokenPrices: TokenPrices) => void;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setSolverId: (solverId: string) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setIsApproving: (isApproving: boolean) => void;
  setAsset: (ioType: IOType, asset: Asset | undefined) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setRate: (rate: number) => void;
  setNetworkFees: (networkFees: number) => void;
  setFixedFee: (fixedFee: number) => void;
  setIsNetworkFeesLoading: (isNetworkFeesLoading: boolean) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setError: (error: SwapErrors) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  setIsEditBTCAddress: (isEditBTCAddress: boolean) => void;
  setIsComparisonVisible: (isComparisonVisible: boolean) => void;
  setIsValidBitcoinAddress: (isValidBitcoinAddress: boolean) => void;
  showComparisonHandler: (type: "time" | "fees") => void;
  hideComparison: () => void;
  updateComparisonSavings: (time: number, cost: number) => void;
  clearSwapState: () => void;
  clear: () => void;
  clearSwapInputState: () => void;
};

export const BTC: Asset = {
  name: "Bitcoin",
  decimals: 8,
  symbol: "BTC",
  icon: "https://garden.imgix.net/token-images/bitcoin.svg",
  token: null,
  htlc: null,
  chain: network === "mainnet" ? Chains.bitcoin : Chains.bitcoin_testnet,
  id: ChainAsset.from(
    `${network === "mainnet" ? Chains.bitcoin : Chains.bitcoin_testnet}:btc`
  ),
};

export const swapStore = create<SwapState>((set) => ({
  inputAsset: BTC,
  inputAmount: "",
  alpenAddress: "",
  outputAmount: "",
  solverId: "",
  rate: 0,
  networkFees: 0,
  fixedFee: 0,
  btcAddress: "",
  isApproving: false,
  isNetworkFeesLoading: false,
  swapInProgress: {
    isOpen: false,
    order: null,
  },
  isSwapping: false,
  tokenPrices: {
    input: "0",
    output: "0",
  },
  fiatTokenPrices: {
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
  showComparison: {
    isTime: false,
    isFees: false,
  },
  maxTimeSaved: 0,
  maxCostSaved: 0,
  setAlpenAddress: (alpenAddress: string) => {
    set((state) => ({
      ...state,
      alpenAddress,
    }));
  },
  setSolverId: (solverId) => {
    set({ solverId });
  },
  setAsset: (ioType, asset) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAsset" : "outputAsset"]: asset,
    }));
  },
  setFiatTokenPrices: (fiatTokenPrices) => {
    set({ fiatTokenPrices });
  },
  setAmount: (ioType, amount) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAmount" : "outputAmount"]: amount,
    }));
  },
  setRate: (rate) => {
    set((state) => ({
      ...state,
      rate,
    }));
  },
  setNetworkFees: (networkFees) => {
    set((state) => ({
      ...state,
      networkFees,
    }));
  },
  setFixedFee: (fixedFee) => {
    set((state) => ({
      ...state,
      fixedFee,
    }));
  },
  setIsNetworkFeesLoading: (isNetworkFeesLoading) => {
    set({ isNetworkFeesLoading });
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

      // Get the potentially swapped assets
      const newInputAsset = state.outputAsset;
      const newOutputAsset = state.inputAsset;

      // Validate the route after swapping
      const { isRouteValid } = assetInfoStore.getState();
      let finalOutputAsset = newOutputAsset;

      if (
        newInputAsset &&
        newOutputAsset &&
        !isRouteValid(newInputAsset, newOutputAsset)
      ) {
        finalOutputAsset = undefined;
      }

      return {
        ...state,
        inputAsset: newInputAsset,
        outputAsset: finalOutputAsset,
        inputAmount: newInputAmount,
        outputAmount: finalOutputAsset ? newOutputAmount : "",
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
  showComparisonHandler: (type) => {
    set({
      isComparisonVisible: true,
      showComparison: {
        isTime: type === "time",
        isFees: type === "fees",
      },
    });
  },
  hideComparison: () => {
    set({
      isComparisonVisible: false,
      showComparison: {
        isTime: false,
        isFees: false,
      },
    });
  },
  updateComparisonSavings: (time, cost) => {
    set({
      maxTimeSaved: time,
      maxCostSaved: cost,
    });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      alpenAddress: "",
      rate: 0,
      btcAddress: "",
      outputAsset: undefined,
      inputAsset: BTC,
      isApproving: false,
      isSwapping: false,
      tokenPrices: {
        input: "0",
        output: "0",
      },
      fiatTokenPrices: {
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
      showComparison: {
        isTime: false,
        isFees: false,
      },
      maxTimeSaved: 0,
      maxCostSaved: 0,
    });
  },
  clear: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      alpenAddress: "",
      rate: 0,
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      isApproving: false,
      tokenPrices: {
        input: "0",
        output: "0",
      },
      fiatTokenPrices: {
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
      showComparison: {
        isTime: false,
        isFees: false,
      },
      maxTimeSaved: 0,
      maxCostSaved: 0,
    });
  },
  clearSwapInputState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      rate: 0,
      tokenPrices: {
        input: "0",
        output: "0",
      },
      fiatTokenPrices: {
        input: "0",
        output: "0",
      },
      error: {
        inputError: Errors.none,
        outputError: Errors.none,
        liquidityError: Errors.none,
        insufficientBalanceError: Errors.none,
      },
    });
  },
}));
