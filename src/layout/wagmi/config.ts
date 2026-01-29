import { hyperevm, alpenTestnet } from "@gardenfi/core";
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
  bscTestnet,
} from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";

declare global {
  interface Window {
    leap?: {
      ethereum?: any;
    };
    keplr?: {
      ethereum?: any;
    };
    backpack?: {
      ethereum?: any;
    };
  }
}

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

export const botanix: Chain = {
  id: 3637,
  name: "Botanix Mainnet",
  nativeCurrency: {
    name: "Botanix",
    symbol: "BTC",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "Botanix Explorer",
      url: "https://botanixscan.io/",
    },
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.botanixlabs.com/"],
    },
  },
};

export const monadMainnet: Chain = {
  id: 143,
  name: "Monad",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://monadvision.com/",
    },
  },
  rpcUrls: {
    default: {
      http: ["https://rpc1.monad.xyz"],
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
  monadMainnet,
  base,
  berachainTestnetbArtio,
  berachain,
  citreaTestnet,
  monadTestnet,
  hyperliquidTestnet,
  hyperevm,
  corn,
  alpenTestnet,
  botanix,
  bscTestnet,
] as const;

export const leapConnector = injected({
  target() {
    return {
      id: "leap",
      name: "Leap Wallet",
      provider:
        typeof window !== "undefined" ? window.leap?.ethereum : undefined,
    };
  },
});

export const backpackConnector = injected({
  target() {
    return {
      id: "backpack",
      name: "Backpack",
      provider:
        typeof window !== "undefined" ? window.backpack?.ethereum : undefined,
    };
  },
});

export const KeplrConnector = injected({
  target() {
    return {
      id: "keplr",
      name: "Keplr",
      provider:
        typeof window !== "undefined" ? window.keplr?.ethereum : undefined,
    };
  },
});

export const config = createConfig({
  chains: SupportedChains,
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "Garden Finance",
      appLogoUrl: "https://garden.imgix.net/token-images/SEED.svg",
    }),
    leapConnector,
    KeplrConnector,
    backpackConnector,
    miniAppConnector(),
  ],
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
    [monadMainnet.id]: http(),
    [berachainTestnetbArtio.id]: http(),
    [berachain.id]: http(),
    [citreaTestnet.id]: http(),
    [monadTestnet.id]: http(),
    [hyperliquidTestnet.id]: http(),
    [hyperevm.id]: http(),
    [corn.id]: http(),
    [botanix.id]: http(),
    [bscTestnet.id]: http(),
    [alpenTestnet.id]: http(),
  },
});
