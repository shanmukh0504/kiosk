import { useWallet, Wallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { network, TronConfig } from "../constants/constants";
import { useEffect, useCallback } from "react";

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
   * Connect + validate network
   */
  const handleTronConnect = useCallback(
    async (selectedWallet: Wallet): Promise<void> => {
      try {
        select(selectedWallet.adapter.name);
        await tronConnect();

        const adapter: any = selectedWallet.adapter;
        if (adapter.network) {
          const net = await adapter.network();
          const currentChainId = net?.chainId;

          if (currentChainId && currentChainId !== expectedChainId) {
            console.warn(
              `⚠️ Wrong network. Expected ${expectedChainId}, got ${currentChainId}. Disconnecting...`
            );
            await disconnect();
            return;
          }
        }

        // Attempt chain switch if supported
        if (adapter.switchChain) {
          await adapter.switchChain(expectedChainId);
        }
      } catch (err) {
        console.error("Tron connect failed:", err);
        await disconnect();
      }
    },
    [select, tronConnect, disconnect, expectedChainId]
  );

  /**
   * React to network/chain changes
   */
  useEffect(() => {
    if (!wallet?.adapter) return;

    const adapter: any = wallet.adapter;

    const handleChainChanged = async (chainData: any) => {
      console.log("🔄 Chain changed:", chainData);

      const newChainId =
        typeof chainData === "string" ? chainData : chainData?.chainId;

      if (newChainId && newChainId !== expectedChainId) {
        console.warn(
          `⚠️ Network changed to ${newChainId}, expected ${expectedChainId}. Disconnecting...`
        );
        await disconnect();
      }
    };

    adapter.on("chainChanged", handleChainChanged);

    return () => {
      adapter.off("chainChanged", handleChainChanged);
    };
  }, [wallet, expectedChainId, disconnect]);

  return {
    handleTronConnect,
    tronConnected: connected,
    tronDisconnect: disconnect,
    wallets,
    tronAddress: address,
    wallet,
  };
};
