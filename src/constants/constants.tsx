import { Asset, isBitcoin, isEVM } from "@gardenfi/orderbook";
import { Environment, Network } from "@gardenfi/utils";

export const INTERNAL_ROUTES = {
  swap: { name: "Swap", path: "/" },
  stake: { name: "Stake", path: "/stake" },
  // quests: { name: "Quests", path: "/quests" },
} as const;

export const THEMES = {
  swap: "swap",
  quests: "quests",
  stake: "stake",
} as const;

export enum IOType {
  input = "input",
  output = "output",
}

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
