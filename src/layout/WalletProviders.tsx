import { FC, ReactNode } from "react";
import { Network } from "@gardenfi/utils";
import { network } from "../constants/constants";
import { WagmiProvider } from "wagmi";
import { BTCWalletProvider } from "@gardenfi/wallet-connectors";
import { StarknetConfig } from "@starknet-react/core";
import { SolanaProvider } from "./solana/SolanaProvider.tsx";
import {
  starknetChains,
  starknetProviders,
  connectors as starknetConnectors,
} from "./starknet/config";
import { config } from "./wagmi/config";
import { MiniAppProvider } from "./MiniAppContextProvider.tsx";
import { STARKNET_CONFIG } from "@gardenfi/core";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProviders: FC<WalletProviderProps> = ({ children }) => {
  return (
    <MiniAppProvider>
      <WagmiProvider config={config}>
        <BTCWalletProvider network={network as Network} store={localStorage}>
          <StarknetConfig
            defaultChainId={BigInt(STARKNET_CONFIG[network].chainId)}
            chains={starknetChains}
            provider={starknetProviders}
            connectors={starknetConnectors}
            autoConnect
          >
            <SolanaProvider>{children}</SolanaProvider>
          </StarknetConfig>
        </BTCWalletProvider>
      </WagmiProvider>
    </MiniAppProvider>
  );
};
