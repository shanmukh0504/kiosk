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
