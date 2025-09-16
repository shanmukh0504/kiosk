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
    if (suiConnected && suiSelectedWallet?.name === wallet.name) {
      return;
    }

    if (suiConnected && suiSelectedWallet?.name !== wallet.name) {
      try {
        await suiDisconnect();
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch {}
    }

    return new Promise<void>((resolve, reject) => {
      connect(
        { wallet },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error: any) => {
            reject(error);
          },
        }
      );
    });
  };

  const suiDisconnect = async () => {

    return new Promise<void>((resolve, reject) => {
      disconnect(undefined, {
        onSuccess: () => {
          resolve();
        },
        onError: (error: any) => {
          reject(error);
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
