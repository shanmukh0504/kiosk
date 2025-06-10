import { hyperliquid } from "@gardenfi/core";
import { http, createConfig } from "wagmi";
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  bsc,
  mainnet,
  optimism,
  polygon,
  sepolia,
  baseSepolia,
  base,
  berachainTestnetbArtio,
  berachain,
  citreaTestnet,
  monadTestnet,
  Chain,
  corn,
} from "wagmi/chains";

import { injected, metaMask } from "wagmi/connectors";

export const hyperliquidTestnet: Chain = {
  id: 998,
  name: "Hyperliquid EVM Testnet",
  nativeCurrency: {
    name: "Hyperliquid",
    symbol: "HYPE",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "Hyperliquid Explorer",
      url: "https://testnet.purrsec.com/",
    },
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid-testnet.xyz/evm"],
    },
  },
};

export const SupportedChains = [
  mainnet,
  arbitrum,
  polygon,
  optimism,
  bsc,
  avalanche,
  arbitrumSepolia,
  sepolia,
  baseSepolia,
  base,
  berachainTestnetbArtio,
  berachain,
  citreaTestnet,
  monadTestnet,
  hyperliquidTestnet,
  hyperliquid,
  corn,
] as const;

export const config = createConfig({
  chains: SupportedChains,
  connectors: [injected(), metaMask()],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [berachainTestnetbArtio.id]: http(),
    [berachain.id]: http(),
    [citreaTestnet.id]: http(),
    [monadTestnet.id]: http(),
    [hyperliquidTestnet.id]: http(),
    [hyperliquid.id]: http(),
    [corn.id]: http(),
  },
});
