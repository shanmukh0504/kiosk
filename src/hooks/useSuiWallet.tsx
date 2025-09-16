import {
  useCurrentWallet,
  useWallets,
  useConnectWallet,
  useDisconnectWallet,
  useCurrentAccount,
} from "@mysten/dapp-kit";
// import { useWallet } from "@mysten/wallet-standard";
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";

export const useSuiWallet = () => {
  const {
    isConnected: suiConnected,
    currentWallet: suiSelectedWallet,
    connectionStatus,
  } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const handleSuiConnect = async (wallet: WalletWithRequiredFeatures) => {
    console.log("sui - Starting connection process:", {
      targetWallet: wallet.name,
      currentWallet: suiSelectedWallet?.name,
      isConnected: suiConnected,
      connectionStatus,
      availableWallets: wallets.map((w) => w.name),
    });

    if (suiConnected && suiSelectedWallet?.name === wallet.name) {
      return;
    }

    if (suiConnected && suiSelectedWallet?.name !== wallet.name) {
      try {
        await suiDisconnect();
        // Add a small delay to let the disconnection complete
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.log(
          "sui - Failed to disconnect previous wallet, proceeding anyway:",
          error
        );
      }
    }

    return new Promise<void>((resolve, reject) => {
      connect(
        { wallet },
        {
          onSuccess: () => {
            console.log("sui - Connection successful:", {
              connectedWallet: wallet.name,
              connectionStatus: "connected",
              actualCurrentWallet: suiSelectedWallet?.name,
            });
            resolve();
          },
          onError: (error: any) => {
            console.log("sui - Connection failed:", {
              targetWallet: wallet.name,
              currentWallet: suiSelectedWallet?.name,
              error: error.message || error,
              errorType: error.constructor.name,
            });
            reject(error);
          },
        }
      );
    });
  };

  const suiDisconnect = async () => {

    // If already disconnected, resolve immediately
    if (!suiConnected) {
      console.log("sui - Already disconnected, skipping disconnection");
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      disconnect(undefined, {
        onSuccess: () => {
          resolve();
        },
        onError: (error: any) => {
          // Don't reject on disconnection failure, just resolve to allow connection to proceed
          console.log("sui - Proceeding despite disconnection failure", error);
          resolve();
        },
      });
    });
  };

  return {
    suiConnected,
    suiSelectedWallet,
    suiWallets: wallets,
    handleSuiConnect,
    suiDisconnect,
    connectionStatus,
    currentAccount,
  };
};
