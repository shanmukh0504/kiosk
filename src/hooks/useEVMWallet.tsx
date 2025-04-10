import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { useChainId } from "wagmi";
import { ClearLocalStorageExceptNotification } from "../utils/utils";
export const useEVMWallet = () => {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { status, connectors, isPending, connectAsync } = useConnect();
  const chainId = useChainId();

  const disconnect = () => {
    disconnectWallet();
    ClearLocalStorageExceptNotification();
  };

  return {
    walletClient,
    address,
    connectors,
    isPending,
    connector,
    isConnected,
    status,
    disconnect,
    connectAsync,
    chainId,
  };
};
