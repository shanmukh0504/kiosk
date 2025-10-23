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
import { SuiProvider } from "./sui/SuiProvider.tsx";
import { FrameProvider } from "./FrameProvider.tsx";
import { TronWalletProvider } from "./tron/TronProvider.tsx";

interface WalletProviderProps {
  children: ReactNode;
}
export const WalletProviders: FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <BTCWalletProvider network={network as Network} store={localStorage}>
        <StarknetConfig
          defaultChainId={BigInt("0x534e5f5345504f4c4941")}
          chains={starknetChains}
          provider={starknetProviders}
          connectors={starknetConnectors}
          autoConnect
        >
          <SolanaProvider>
            <SuiProvider>
              <TronWalletProvider>
                <FrameProvider>{children}</FrameProvider>
              </TronWalletProvider>
            </SuiProvider>
          </SolanaProvider>
        </StarknetConfig>
      </BTCWalletProvider>
    </WagmiProvider>
  );
};
