import { BTCLogo } from "@gardenfi/garden-book";
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

export type Asset = {
  icon: React.ReactNode;
  ticker: string;
  name: string;
  chain: string;
  decimals: number;
};

export const SupportedAssets: Record<string, Asset> = {
  BTC: {
    icon: <BTCLogo />,
    ticker: "BTC",
    name: "Bitcoin",
    chain: "Bitcoin",
    decimals: 8,
  },
  WBTC: {
    icon: <BTCLogo />,
    ticker: "WBTC",
    name: "Wrapped Bitcoin",
    chain: "Ethereum",
    decimals: 8,
  },
  ETH: {
    icon: <BTCLogo />,
    ticker: "ETH",
    name: "Ethereum",
    chain: "Ethereum",
    decimals: 18,
  },
};
