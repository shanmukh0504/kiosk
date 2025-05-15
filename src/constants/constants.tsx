import { Asset, Chain, isBitcoin, isEVM } from "@gardenfi/orderbook";
import { BitcoinNetwork } from "@gardenfi/react-hooks";
import { Network } from "@gardenfi/utils";

export const INTERNAL_ROUTES: Record<string, { name: string; path: string[] }> =
  {
    swap: { name: "Swap", path: ["/", "/swap"] },
    stake: { name: "Stake", path: ["/stake"] },
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

export const network: Network = import.meta.env.VITE_NETWORK;
export const environment: Environment = import.meta.env.VITE_ENVIRONMENT;

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
] as const;

export const QUERY_PARAMS = {
  inputChain: "input-chain",
  inputAsset: "input-asset",
  outputChain: "output-chain",
  outputAsset: "output-asset",
};
