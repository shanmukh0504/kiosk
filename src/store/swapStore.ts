import { create } from "zustand";
import { Asset, ChainAsset, Chains } from "@gardenfi/orderbook";
import { IOType, network } from "../constants/constants";
import { ErrorFormat, Errors } from "../constants/errors";
import { assetInfoStore } from "./assetInfoStore";
import { walletAddressStore } from "./walletAddressStore";

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
  solverId: string;
  inputAmount: string;
  outputAmount: string;
  rate: number;
  networkFees: number;
  fixedFee: number;
  isSwapping: boolean;
  isApproving: boolean;
  tokenPrices: TokenPrices;
  fiatTokenPrices: TokenPrices;
  error: SwapErrors;
  isNetworkFeesLoading: boolean;
  isFetchingQuote: FetchingQuote;
  isEditAddress: { source: boolean; destination: boolean };
  isComparisonVisible: boolean;
  validAddress: { source: boolean; destination: boolean };
  showComparison: {
    isTime: boolean;
    isFees: boolean;
  };
  maxTimeSaved: number;
  maxCostSaved: number;
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
  swapAssets: () => void;
  setError: (error: SwapErrors) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  setIsEditAddress: (isEditAddress: {
    source: boolean;
    destination: boolean;
  }) => void;
  setIsComparisonVisible: (isComparisonVisible: boolean) => void;
  setValidAddress: (validAddress: {
    source: boolean;
    destination: boolean;
  }) => void;
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
  outputAmount: "",
  solverId: "",
  rate: 0,
  networkFees: 0,
  fixedFee: 0,
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
  isEditAddress: { source: false, destination: false },
  isComparisonVisible: false,
  validAddress: { source: true, destination: true },
  showComparison: {
    isTime: false,
    isFees: false,
  },
  maxTimeSaved: 0,
  maxCostSaved: 0,
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

      const swappedValidAddress = {
        source: state.validAddress.destination,
        destination: state.validAddress.source,
      };

      const swappedIsEditAddress = {
        source: state.isEditAddress.destination,
        destination: state.isEditAddress.source,
      };

      // Handle address swapping: always swap addresses (useWallet will handle clearing/repopulating based on chain type)
      const currentAddresses = walletAddressStore.getState().address;

      if (newInputAsset && finalOutputAsset) {
        // Always swap addresses - useWallet will handle clearing/repopulating if chain types changed
        walletAddressStore.getState().setAddress({
          source: currentAddresses.destination,
          destination: currentAddresses.source,
        });
      } else {
        // If assets are undefined, clear addresses
        walletAddressStore.getState().clearAddresses();
      }

      return {
        ...state,
        inputAsset: newInputAsset,
        outputAsset: finalOutputAsset,
        inputAmount: newInputAmount,
        outputAmount: finalOutputAsset ? newOutputAmount : "",
        validAddress: swappedValidAddress,
        isEditAddress: swappedIsEditAddress,
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
  setIsEditAddress: (isEditAddress) => {
    set({ isEditAddress });
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
  setValidAddress: (validAddress) => {
    set({ validAddress });
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
      rate: 0,
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
      isEditAddress: { source: false, destination: false },
      validAddress: { source: true, destination: true },
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
      isEditAddress: { source: false, destination: false },
      validAddress: { source: true, destination: true },
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
