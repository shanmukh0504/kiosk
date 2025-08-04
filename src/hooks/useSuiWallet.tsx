import { useCurrentWallet, useWallets } from "@mysten/dapp-kit";

export const useSuiWallet = () => {
  const { isConnected: suiConnected, currentWallet: suiSelectedWallet } =
    useCurrentWallet();
  const wallets = useWallets();
  return {
    suiConnected,
    suiSelectedWallet,
    suiWallets: wallets,
  };
};
