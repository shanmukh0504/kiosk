import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { useChainId } from "wagmi";
export const useEVMWallet = () => {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { status, connectors, isPending, connectAsync } = useConnect();
  const chainId = useChainId();

  const disconnect = () => {
    disconnectWallet();
    localStorage.clear();
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
