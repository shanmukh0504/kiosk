import { useNavigate } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { useChainId } from "wagmi";
export const useEVMWallet = () => {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { status, connectors, isPending, connectAsync } = useConnect();
  const chainId = useChainId();
  const navigate = useNavigate();

  const disconnect = () => {
    disconnectWallet();
    localStorage.clear();
    navigate("/");
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
