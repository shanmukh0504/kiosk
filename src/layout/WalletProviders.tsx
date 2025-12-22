import { FC, ReactNode } from "react";
import { Network } from "@gardenfi/utils";
import { network } from "../constants/constants";
import { WagmiProvider } from "wagmi";
import {
  BTCWalletProvider,
  LTCWalletProvider,
} from "@gardenfi/wallet-connectors";
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
import { constants as starknetConstants } from "starknet";

interface WalletProviderProps {
  children: ReactNode;
}
export const WalletProviders: FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <BTCWalletProvider network={network as Network} store={localStorage}>
        <LTCWalletProvider network={network as Network} store={localStorage}>
          <StarknetConfig
            defaultChainId={
              network === Network.MAINNET
                ? BigInt(starknetConstants.StarknetChainId.SN_MAIN)
                : BigInt(starknetConstants.StarknetChainId.SN_SEPOLIA)
            }
            chains={starknetChains}
            provider={starknetProviders}
            connectors={starknetConnectors}
            autoConnect
          >
            <SolanaProvider>
              <SuiProvider>
                <FrameProvider>{children}</FrameProvider>
              </SuiProvider>
            </SolanaProvider>
          </StarknetConfig>
        </LTCWalletProvider>
      </BTCWalletProvider>
    </WagmiProvider>
  );
};
