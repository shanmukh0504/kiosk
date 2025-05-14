import {
  useWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  } = useWallet();

  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingConnect, setPendingConnect] = useState<(() => void) | null>(
    null
  );

  const provider = useMemo(() => {
    return anchorWallet
      ? new AnchorProvider(connection, anchorWallet, {})
      : null;
  }, [connection, anchorWallet]);

  useEffect(() => {
    if (connected && pendingConnect) {
      pendingConnect();
      setPendingConnect(null);
      setIsConnecting(false);
    }
  }, [connected, pendingConnect]);

  const handleWalletClick = useCallback(
    async (walletName: WalletName) => {
      setIsConnecting(true);
      const w = wallets.find(
        (w) => w.adapter.name.toLowerCase() === walletName.toLowerCase()
      );
      select(walletName);
      await w?.adapter.connect();
      return true;
    },
    [select, connected]
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
    solanaConnecting: isConnecting || connecting,
    solanaConnected: connected,
    solanaAddress: provider?.publicKey.toBase58(),
    solanaAnchorProvider: provider,
    connection,
    // solanaConnectionError: connectionError,
  };
};
