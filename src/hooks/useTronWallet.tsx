import { useWallet, Wallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { network, TronConfig } from "../constants/constants";
import { useCallback } from "react";

export const useTronWallet = () => {
  const {
    connect: tronConnect,
    wallets,
    address,
    wallet,
    select,
    connected,
    disconnect,
  } = useWallet();

  const expectedChainId = TronConfig[network].chainId;

  /**
   * Safely disconnect wallet
   */
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Tron disconnect error:", error);
    }
  }, [disconnect]);

  /**
   * Connect or switch network logic
   */
  const handleTronConnect = useCallback(
    async (selectedWallet: Wallet): Promise<void> => {
      try {
        if (!wallet || wallet.adapter.name !== selectedWallet.adapter.name) {
          select(selectedWallet.adapter.name);
        }

        await tronConnect();

        if (wallet?.adapter?.switchChain) {
          await wallet.adapter.switchChain(expectedChainId);
        } else {
          console.log(
            `Wallet adapter ${wallet?.adapter?.name} does not support switchChain()`
          );
        }
      } catch (error) {
        console.error("Tron connect/switch error:", error);
      }
    },
    [wallet, connected, tronConnect, expectedChainId, select]
  );

  return {
    handleTronConnect,
    tronConnected: connected,
    tronDisconnect: handleDisconnect,
    wallets,
    tronAddress: address,
    wallet,
  };
};
