import { useXRPLContext } from "../layout/xrpl/XRPLProvider";

export const useXRPLWallet = () => {
  const {
    xrplAddress,
    xrplConnected,
    isConnecting,
    isCrossmarkInstalled,
    handleXRPLConnect,
    handleXRPLDisconnect,
    xrplWallet,
  } = useXRPLContext();

  return {
    xrplWallet,
    xrplAddress,
    xrplConnected,
    xrplConnecting: isConnecting,
    handleXRPLConnect,
    handleXRPLDisconnect,
    isCrossmarkInstalled,
  };
};
