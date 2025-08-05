import {
  useCurrentWallet,
  useWallets,
  useConnectWallet,
  useDisconnectWallet,
  useAccounts,
  useCurrentAccount,
} from "@mysten/dapp-kit";
// import { useWallet } from "@mysten/wallet-standard";
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
import type { Wallet, WalletAccount } from "@mysten/wallet-standard";

export type SuiWalletType = Wallet;

export const useSuiWallet = () => {
  const {
    isConnected: suiConnected,
    currentWallet: suiSelectedWallet,
    connectionStatus,
  } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const accounts = useAccounts();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  // const { data: account } = useWallet();
  const signer = suiSelectedWallet?.features["sui:signAndExecuteTransaction"];
  const handleSuiConnect = async (wallet: WalletWithRequiredFeatures) => {
    return new Promise<void>((resolve, reject) => {
      connect(
        { wallet },
        {
          onSuccess: () => {
            console.log("connected");
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
          console.log("disconnected");
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
    suiWallets: wallets as Wallet[],
    handleSuiConnect,
    suiDisconnect,
    connectionStatus,
    currentAccount,
  };
};
