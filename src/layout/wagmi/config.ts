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
} from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";
import { SupportedChains } from "../../constants/constants";

const projectId = "badd60eb677f972ec3c2454256ccfbc8";

export const config = createConfig({
  chains: SupportedChains,
  connectors: [injected(), walletConnect({ projectId }), metaMask(), safe()],
  multiInjectedProviderDiscovery: true,
  cacheTime: 10_000,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(),
  },
});