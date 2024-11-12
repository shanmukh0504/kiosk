import { create } from "zustand";
import { IOType, network } from "../constants/constants";
import { Asset, Chains, MatchedOrder } from "@gardenfi/orderbook";

type SwapState = {
  inputAsset?: Asset;
  outputAsset?: Asset;
  inputAmount: string;
  outputAmount: string;
  btcAddress: string;
  btcInitModal: { isOpen: boolean; order: MatchedOrder | null };
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setShowConfirmSwap: (confirmSwap: {
    isOpen: boolean;
    order: MatchedOrder;
  }) => void;
  closeBTCInitModal: () => void;
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

const USDC = {
  name: "USD Coin",
  decimals: 6,
  symbol: "USDC",
  logo: "https://garden-finance.imgix.net/token-images/usdc.svg",
  tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  atomicSwapAddress: "0x00ab86f54F436CfE15253845F139955ae0C00bAf",
  chain: Chains.base,
};

export const swapStore = create<SwapState>((set) => ({
  inputAsset: USDC,
  outputAsset: BTC,
  inputAmount: "5",
  outputAmount: "",
  btcAddress: "",
  btcInitModal: {
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
  setShowConfirmSwap: (btcInitModal) => {
    set(
      (state) =>
        (state = {
          ...state,
          btcInitModal,
        })
    );
  },
  closeBTCInitModal: () => {
    set({ btcInitModal: { isOpen: false, order: null } });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
    });
  },
}));
