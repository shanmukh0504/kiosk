import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { network } from "../../constants/constants";
import { Network } from "@gardenfi/utils";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const solanaNetwork =
    network === Network.MAINNET
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), [solanaNetwork]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
