import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { FC, ReactNode } from "react";

interface SuiProviderProps {
  children: ReactNode;
}

export const SuiProvider: FC<SuiProviderProps> = ({ children }) => {
  return (
    <SuiClientProvider>
      <WalletProvider autoConnect={true}>{children}</WalletProvider>
    </SuiClientProvider>
  );
};
