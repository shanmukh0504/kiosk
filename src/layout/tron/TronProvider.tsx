import React, { useMemo, PropsWithChildren } from "react";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters";

export const TronWalletProvider: React.FC<PropsWithChildren<object>> = ({
  children,
}) => {
  const adapters = useMemo(() => [new TronLinkAdapter()], []);

  const handleError = (error: unknown) => {
    console.error("Wallet error", error);
  };

  return (
    <WalletProvider adapters={adapters} onError={handleError}>
      {children}
    </WalletProvider>
  );
};
