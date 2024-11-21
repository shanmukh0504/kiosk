import { Asset, isBitcoin, isEVM } from "@gardenfi/orderbook";
import { environment } from "@gardenfi/react-hooks";

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

export const network: environment = import.meta.env.VITE_NETWORK;
