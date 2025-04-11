import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

export const useStarknetWallet = () => {
  const { address: starknetAddress, account: starknetAccount } = useAccount();
  const {
    connectors: starknetConnectors,
    connector: starknetConnector,
    connectAsync: starknetConnect,
  } = useConnect();
  const { disconnect: starknetDisconnect } = useDisconnect();
  return {
    starknetConnect,
    starknetConnectors,
    starknetConnector,
    starknetDisconnect,
    starknetAddress,
    starknetAccount,
  };
};
