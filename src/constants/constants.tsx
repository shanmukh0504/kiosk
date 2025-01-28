import { Asset, isBitcoin, isEVM } from "@gardenfi/orderbook";
import { Environment, Network } from "@gardenfi/utils";
import { ErrorFormat } from "../store/swapStore";

export const INTERNAL_ROUTES = {
  swap: { name: "Swap", path: "/" },
  // quests: { name: "Quests", path: "/quests" },
} as const;

export const THEMES = {
  swap: "swap",
  quests: "quests",
} as const;

export enum IOType {
  input = "input",
  output = "output",
}

export enum QuoteError {
  InsufficientLiquidity = "Insufficient Liquidity",
  None = "",
}

export const Errors = {
  minError: (amount: string, asset: string): ErrorFormat =>
    `Minimum amount is ${amount} ${asset}`,
  maxError: (amount: string, asset: string): ErrorFormat =>
    `Maximum amount is ${amount} ${asset}`,
  outHigh: "Output amount too high" as const,
  outLow: "Output amount too less" as const,
  none: "" as const,
} as const;

export const LOCAL_STORAGE_KEYS = {
  notification: "notificationId",
};

export const BREAKPOINTS = {
  xs: 360,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1440,
  "2xl": 1536,
};

export const getTimeEstimates = (inputAsset: Asset) => {
  if (isEVM(inputAsset.chain)) {
    return "~30s";
  }
  if (isBitcoin(inputAsset.chain)) {
    return "~10m";
  }
  return "";
};

export const network: Environment | Network = import.meta.env.VITE_NETWORK;
