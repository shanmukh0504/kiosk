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
} from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

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
  },
});
