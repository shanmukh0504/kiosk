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
import { STARKNET_CONFIG } from "@gardenfi/core";
import { SuiProvider } from "./sui/SuiProvider.tsx";

interface WalletProviderProps {
  children: ReactNode;
}
console.log("network", network);
console.log("STARKNET_CONFIG", STARKNET_CONFIG);
console.log("STARKNET_CONFIG[network]", STARKNET_CONFIG[network]);
console.log("STARKNET_CONFIG[network].chainId", STARKNET_CONFIG[network].chainId);
export const WalletProviders: FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <BTCWalletProvider network={network as Network} store={localStorage}>
        <StarknetConfig
          defaultChainId={BigInt(STARKNET_CONFIG[network].chainId)}
          chains={starknetChains}
          provider={starknetProviders}
          connectors={starknetConnectors}
          autoConnect
        >
          <SolanaProvider>
            <SuiProvider>{children}</SuiProvider>
          </SolanaProvider>
        </StarknetConfig>
      </BTCWalletProvider>
    </WagmiProvider>
  );
};
