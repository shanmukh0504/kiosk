import { FC, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { network } from "../../constants/constants";
import { Network } from "@gardenfi/utils";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const rpcEndpoint =
    network === Network.MAINNET
      ? "https://solana-rpc.publicnode.com"
      : "https://api.devnet.solana.com";

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={[]} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
