import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { FC, ReactNode } from "react";
import { network } from "../../constants/constants";
import { Network } from "@gardenfi/utils";

interface SuiProviderProps {
  children: ReactNode;
}

export const SuiProvider: FC<SuiProviderProps> = ({ children }) => {
  const { networkConfig } = createNetworkConfig({
    testnet: {
      url: "https://fullnode.testnet.sui.io:443",
    },
    mainnet: {
      url: "https://fullnode.mainnet.sui.io:443",
    },
  });

  return (
    <SuiClientProvider
      networks={networkConfig}
      defaultNetwork={network ? Network.MAINNET : Network.TESTNET}
    >
      <WalletProvider autoConnect={true}>{children}</WalletProvider>
    </SuiClientProvider>
  );
};
