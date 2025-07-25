import React, { createContext, useContext, useEffect, useState } from "react";

interface MiniAppContextType {
  isInCoinbaseWallet: boolean;
  supportsMiniAppFeatures: boolean;
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

export const useMiniApp = () => {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }
  return context;
};

interface MiniAppProviderProps {
  children: React.ReactNode;
}

export const MiniAppProvider: React.FC<MiniAppProviderProps> = ({
  children,
}) => {
  const [isInCoinbaseWallet, setIsInCoinbaseWallet] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      typeof window.ethereum !== "undefined" &&
      (window.ethereum as { isCoinbaseWallet?: boolean })?.isCoinbaseWallet ===
        true
    );
  });

  useEffect(() => {
    const updateEnvironment = () => {
      setIsInCoinbaseWallet(
        typeof window.ethereum !== "undefined" &&
          (window.ethereum as { isCoinbaseWallet?: boolean })
            ?.isCoinbaseWallet === true
      );
    };

    // Update environment on mount and when window changes
    updateEnvironment();

    // Listen for potential environment changes
    window.addEventListener("focus", updateEnvironment);
    window.addEventListener("resize", updateEnvironment);

    return () => {
      window.removeEventListener("focus", updateEnvironment);
      window.removeEventListener("resize", updateEnvironment);
    };
  }, []);

  const value: MiniAppContextType = {
    isInCoinbaseWallet,
    supportsMiniAppFeatures: isInCoinbaseWallet,
  };

  return (
    <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>
  );
};
