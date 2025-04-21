import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

export const useStarknetWallet = () => {
  const {
    connect: starknetConnect,
    connectors,
    connector: activeConnector,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();

  return {
    starknetConnect,
    starknetConnectors: connectors,
    starknetConnector: activeConnector,
    starknetDisconnect: disconnect,
    starknetAddress: address,
    starknetStatus: status,
  };
};
