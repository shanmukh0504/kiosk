import { Asset, isBitcoin, isEVM } from "@gardenfi/orderbook";
import { environment } from "@gardenfi/react-hooks";

export const INTERNAL_ROUTES = {
  swap: { name: "Swap", path: "/" },
  // quests: { name: "Quests", path: "/quests" },
} as const;

export const SUPPORTED_WALLETS = {
  Injected: { name: "Browser Wallet", imgSrc: "https://garden-finance.imgix.net/wallets/injected.svg" },
  MetaMask: { name: "MetaMask", imgSrc: "https://garden-finance.imgix.net/wallets/metamask.svg" },
  "Coinbase Wallet": { name: "Coinbase Wallet", imgSrc: "https://garden-finance.imgix.net/wallets/coinbase.svg" },
  "OKX Wallet": { name: "OKX Wallet", imgSrc: "https://garden-finance.imgix.net/wallets/okx.svg" },
  Phantom: { name: "Phantom", imgSrc: "https://garden-finance.imgix.net/wallets/phantom.svg" },
  "Rabby Wallet": { name: "Rabby Wallet", imgSrc: "https://garden-finance.imgix.net/wallets/rabby .svg" },
}

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
