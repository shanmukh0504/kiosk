import { hyperliquid } from "@gardenfi/core";
import {
  Asset,
  Chain,
  isBitcoin,
  isEVM,
  isSolana,
  isStarknet,
  isSui,
} from "@gardenfi/orderbook";
import { BitcoinNetwork } from "@gardenfi/react-hooks";
import { Network } from "@gardenfi/utils";
import { citreaTestnet } from "viem/chains";
import { botanix } from "../layout/wagmi/config";

export const network: Network = import.meta.env.VITE_NETWORK;
export const environment: Environment = import.meta.env.VITE_ENVIRONMENT;
export const isTestnet = network === Network.TESTNET;

export const INTERNAL_ROUTES: Record<
  string,
  { name: string; path: string[]; enabled: boolean; isExternal?: boolean }
> = {
  swap: {
    name: "Swap",
    path: ["/", "/swap"],
    enabled: true,
    isExternal: false,
  },
  stake: {
    name: "Stake",
    path: ["/stake"],
    enabled: network !== Network.TESTNET,
    isExternal: false,
  },
  faucet: {
    name: "Faucet",
    path: ["https://testnetbtc.com"],
    enabled: network === Network.TESTNET,
    isExternal: true,
  },
  // quests: { name: "Quests", path: "/quests" },
} as const;

export const EXTERNAL_ROUTES: Record<
  string,
  { name: string; path: string; enabled: boolean; isExternal?: boolean }
> = {
  docs: {
    name: "Docs",
    path: "https://docs.garden.finance/",
    enabled: true,
    isExternal: true,
  },
  blog: {
    name: "Blog",
    path: "https://garden.finance/blog",
    enabled: true,
    isExternal: true,
  },
  explorer: {
    name: "Explorer",
    path:
      network === Network.TESTNET
        ? "https://testnet-explorer.garden.finance/"
        : "https://explorer.garden.finance/",
    enabled: true,
    isExternal: true,
  },
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
  deletedOrders: "deleted_orders",
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
  if (
    isEVM(inputAsset.chain) ||
    isSolana(inputAsset.chain) ||
    isStarknet(inputAsset.chain) ||
    isSui(inputAsset.chain)
  ) {
    return "~30s";
  }
  if (isBitcoin(inputAsset.chain)) {
    return "~10m";
  }

  return "";
};

export const getBitcoinNetwork = (): BitcoinNetwork => {
  if (network === Network.MAINNET) {
    return BitcoinNetwork.Mainnet;
  }
  if (network === Network.TESTNET) {
    return BitcoinNetwork.Testnet;
  }
  //TODO: Add regtest once we have a testnet for it
  return BitcoinNetwork.Mainnet;
};

export enum Environment {
  Staging = "staging",
  Development = "development",
  Production = "production",
}

export const SUPPORTED_CHAINS: Chain[] = [
  "arbitrum",
  "base",
  "bera",
  "bitcoin",
  "ethereum",
  "bitcoin_testnet",
  "ethereum_sepolia",
  "base_sepolia",
  "arbitrum_sepolia",
  "bera_testnet",
  "citrea_testnet",
  "monad_testnet",
  "hyperliquid_testnet",
  "starknet_sepolia",
  "hyperliquid",
  "starknet",
  "solana_testnet",
  "unichain",
  "corn",
  "solana",
  "botanix",
  "bnbchain",
  "bnbchain_testnet",
  "sui",
  "sui_testnet",
  "core",
] as const;

export const MULTICALL_CONTRACT_ADDRESSES: Record<number, string> = {
  [hyperliquid.id]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [citreaTestnet.id]: "0x8470Ee1FCD47e7F9B90486bB5D142430e5C1f409",
  [botanix.id]: "0xeaE7721d779276eb0f5837e2fE260118724a2Ba4",
};

export const QUERY_PARAMS = {
  inputChain: "input-chain",
  inputAsset: "input-asset",
  outputChain: "output-chain",
  outputAsset: "output-asset",
  inputAmount: "value",
};

export const routes = Object.entries(INTERNAL_ROUTES).filter(([key]) => {
  return INTERNAL_ROUTES[key].enabled;
});

export const externalRoutes = Object.entries(EXTERNAL_ROUTES).filter(
  ([key]) => {
    return EXTERNAL_ROUTES[key].enabled;
  }
);

//if the wallet is not listed here, then it supports all chains
export const WALLET_SUPPORTED_CHAINS: Record<string, Chain[]> = {
  "app.phantom": ["solana", "ethereum", "base", "bitcoin"],
  leap: [
    "ethereum",
    "base",
    "bitcoin",
    "arbitrum",
    "solana",
    "bera",
    "hyperliquid",
    "unichain",
    "citrea_testnet",
  ],
  keplr: [
    "ethereum",
    "base",
    "bitcoin",
    "arbitrum",
    "starknet",
    "bera",
    "unichain",
    "citrea_testnet",
    "ethereum_sepolia",
    "starknet_sepolia",
  ],
  "app.backpack": ["ethereum", "solana", "sui", "base", "arbitrum", "bera"],
};

export const SOCIAL_LINKS = {
  discord: "https://discord.com/invite/dZwSjh9922",
  x: "https://x.com/garden_finance",
};

export const SUI_SOLVER_ADDRESS =
  "0x6e416201f2e6547293f5cd52d4a420bf26ceda4d3ef01283ab720d9fa927b5c2";

export const SUI_DEFAULT_NETWORK_FEE = 0.03;
export const BITCOIN_DEFAULT_NETWORK_FEE = 0.49;
