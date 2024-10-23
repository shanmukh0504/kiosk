import { Asset } from "@gardenfi/orderbook";
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  bsc,
  mainnet,
  optimism,
  polygon,
  sepolia,
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
  arbitrumSepolia,
  sepolia,
] as const;

export const BTC: Asset = {
  logo: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  symbol: "BTC",
  name: "Bitcoin",
  decimals: 8,
  chain: "bitcoin",
  atomicSwapAddress: "primary",
  tokenAddress: "primary",
};

export enum IOType {
  input = "input",
  output = "output",
}
