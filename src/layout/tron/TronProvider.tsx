import React, { useMemo, PropsWithChildren } from "react";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import {
  TronLinkAdapter,
  // other adapters if needed e.g. WalletConnectAdapter
} from "@tronweb3/tronwallet-adapters";

// Use `object` instead of `{}` to satisfy the linter and be more precise.
export const TronWalletProvider: React.FC<PropsWithChildren<object>> = ({
  children,
}) => {
  const adapters = useMemo(
    () => [
      new TronLinkAdapter(),
      // e.g. new WalletConnectAdapter({ /* config */ }),
    ],
    []
  );

  const handleError = (error: unknown) => {
    console.error("Wallet error", error);
    // you may display a toast to the user
  };

  return (
    <WalletProvider adapters={adapters} onError={handleError}>
      {children}
    </WalletProvider>
  );
};
