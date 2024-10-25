import {
  arbitrum,
  avalanche,
  bsc,
  mainnet,
  optimism,
  polygon,
} from "viem/chains";

export const INTERNAL_ROUTES = {
  swap: { name: "Swap", path: "/" },
  quests: { name: "Quests", path: "/quests" },
} as const;

export const THEMES = {
  swap: "swap",
  quests: "quests",
} as const;

export const SupportedChains = [
  mainnet,
  arbitrum,
  polygon,
  optimism,
  bsc,
  avalanche,
] as const;

// TODO: Create a types directory for these
export type Chain = {
  icon: string;
  chainId: number;
  name: string;
};

export type Asset = {
  icon: string;
  ticker: string;
  name: string;
  chainId: number;
  decimals: number;
};

export const BTC: Asset = {
  icon: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  ticker: "BTC",
  name: "Bitcoin",
  chainId: 1,
  decimals: 8,
}

// TODO: This will likely be removed in favor of a type from GardenJS
export type SwapDetails = {
  sendAsset: Asset;
  receiveAsset: Asset;
  sendAmount: string;
  receiveAmount: string;
  address: string;
}

export enum IOType {
  input = "input",
  output = "output",
}