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
    return new Promise<void>((resolve, reject) => {
      connect(
        { wallet },
        {
          onSuccess: () => {
            // console.log("connected");
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
          // console.log("disconnected");
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
