import {
  useWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { WalletName } from "@solana/wallet-adapter-base";

export const useSolanaWallet = () => {
  const {
    select,
    wallets,
    wallet: selectedWallet,
    disconnect,
    connecting,
    connected,
    publicKey,
  } = useWallet();

  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!anchorWallet) return null;
    return new AnchorProvider(connection, anchorWallet, {});
  }, [connection, anchorWallet]);

  const handleWalletClick = useCallback(
    (walletName: WalletName) => {
      select(walletName);
    },
    [select]
  );

  const solanaDisconnect = useCallback(async () => {
    try {
      await disconnect();
      return true;
    } catch (error) {
      console.error("Failed to disconnect Solana wallet:", error);
      return false;
    }
  }, [disconnect]);

  return {
    solanaWallet: anchorWallet,
    solanaConnect: handleWalletClick,
    solanaWallets: wallets,
    solanaSelectedWallet: selectedWallet,
    solanaDisconnect,
    solanaConnecting: connecting,
    solanaConnected: connected,
    solanaAddress: publicKey?.toBase58(),
    solanaAnchorProvider: provider,
    connection,
    solanaConnectionError: null,
  };
};
