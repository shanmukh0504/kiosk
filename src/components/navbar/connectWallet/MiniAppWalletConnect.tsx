import React, { useState } from "react";
import { Typography, CloseIcon } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { getAvailableWallets } from "./getSupportedWallets";
import { handleEVMConnect } from "./handleConnect";
import { ConnectingWalletStore } from "../../../store/connectWalletStore";

interface MiniAppWalletConnectProps {
  onClose: () => void;
}

export const MiniAppWalletConnect: React.FC<MiniAppWalletConnectProps> = ({
  onClose,
}) => {
  const { connectors, connectAsync } = useEVMWallet();
  const { setConnectingWallet } = ConnectingWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const availableWallets = getAvailableWallets(undefined, connectors);
  const coinbaseWallet = availableWallets.find(
    (wallet) => wallet.id === "com.coinbase.wallet"
  );

  const handleConnectCoinbaseWallet = async () => {
    if (!coinbaseWallet?.wallet?.evmWallet) {
      console.error("Coinbase Wallet not available");
      return;
    }

    setIsConnecting(true);
    setConnectingWallet("com.coinbase.wallet");

    try {
      await handleEVMConnect(coinbaseWallet.wallet.evmWallet, connectAsync);
      onClose();
    } catch (error) {
      console.error("Error connecting to Coinbase Wallet:", error);
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  return (
    <div className="flex max-h-[400px] flex-col gap-[20px] p-3">
      <div className="flex items-center justify-between">
        <Typography size="h4" weight="bold">
          Connect Coinbase Wallet
        </Typography>
        <CloseIcon className="h-[14px] w-6 cursor-pointer" onClick={onClose} />
      </div>

      <div className="flex flex-col gap-4">
        <Typography size="h5" className="text-gray-600">
          Connect your Coinbase Wallet to start using Garden Kiosk
        </Typography>

        {coinbaseWallet && coinbaseWallet.isAvailable ? (
          <button
            onClick={handleConnectCoinbaseWallet}
            disabled={isConnecting}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 disabled:opacity-50"
          >
            <img
              src={coinbaseWallet.logo}
              alt={coinbaseWallet.name}
              className="h-8 w-8 rounded-full"
            />
            <div className="flex flex-col items-start">
              <Typography size="h3" weight="medium">
                {coinbaseWallet.name}
              </Typography>
              <Typography size="h5" className="text-gray-600">
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Typography>
            </div>
          </button>
        ) : (
          <div className="rounded-lg border border-gray-200 p-4 text-center">
            <Typography size="h5" className="text-gray-600">
              Coinbase Wallet is not available. Please make sure you&apos;re
              using the Coinbase Wallet app.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
