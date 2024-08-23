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
