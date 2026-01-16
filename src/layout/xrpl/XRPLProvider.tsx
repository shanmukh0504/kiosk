import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  FC,
} from "react";
import sdk from "@crossmarkio/sdk";
import { network } from "../../constants/constants";

interface XRPLContextType {
  xrplAddress: string | undefined;
  xrplConnected: boolean;
  isConnecting: boolean;
  isCrossmarkInstalled: boolean;
  handleXRPLConnect: () => Promise<boolean>;
  handleXRPLDisconnect: () => void;
  xrplWallet: typeof sdk;
}

const XRPLContext = createContext<XRPLContextType | undefined>(undefined);

interface XRPLProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "xrpl_connected_address";
const STORAGE_TIMESTAMP_KEY = "xrpl_connected_timestamp";
const STORAGE_NETWORK_KEY = "xrpl_connected_network";
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

// Helper function to check if the current network matches the app's network setting
const isNetworkMatching = (): boolean => {
  try {
    const networkInfo = sdk.sync.getNetwork();
    if (!networkInfo?.type) return false;
    return networkInfo.type === network;
  } catch (error) {
    console.error("Error checking XRPL network:", error);
    return false;
  }
};

// Helper function to clear all localStorage items
const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  localStorage.removeItem(STORAGE_NETWORK_KEY);
};

// Helper function to save session to localStorage
const saveSession = (address: string): void => {
  localStorage.setItem(STORAGE_KEY, address);
  localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  localStorage.setItem(STORAGE_NETWORK_KEY, network);
};

// Helper function to get stored session data
const getStoredSession = () => ({
  address: localStorage.getItem(STORAGE_KEY),
  timestamp: localStorage.getItem(STORAGE_TIMESTAMP_KEY),
  storedNetwork: localStorage.getItem(STORAGE_NETWORK_KEY),
});

// Helper function to check if stored session is valid
const isStoredSessionValid = (): boolean => {
  const { address, timestamp, storedNetwork } = getStoredSession();
  if (!address || !timestamp) return false;

  if (storedNetwork !== network) return false;

  const sessionAge = Date.now() - parseInt(timestamp);
  return sessionAge < SESSION_MAX_AGE;
};

export const XRPLProvider: FC<XRPLProviderProps> = ({ children }) => {
  const [xrplAddress, setXrplAddress] = useState<string | undefined>(undefined);
  const [xrplConnected, setXrplConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCrossmarkInstalled, setIsCrossmarkInstalled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to disconnect and clear state
  const disconnect = useCallback(() => {
    setXrplAddress(undefined);
    setXrplConnected(false);
    clearStorage();
  }, []);

  // Helper function to connect and save state
  const connect = useCallback((address: string) => {
    setXrplAddress(address);
    setXrplConnected(true);
    saveSession(address);
  }, []);

  // Restore session after reload
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 10;

    const checkInstallation = async (): Promise<boolean> => {
      while (retryCount < maxRetries && mounted) {
        const installed = sdk.sync.isInstalled();

        if (installed) {
          return true;
        }

        retryCount++;
        await new Promise((r) => setTimeout(r, 300));
      }

      return false;
    };

    const init = async () => {
      try {
        const installed = await checkInstallation();

        if (!mounted) return;

        setIsCrossmarkInstalled(installed);

        if (!installed) {
          disconnect();
          setIsInitialized(true);
          return;
        }

        // Restore session if valid and network matches
        if (isStoredSessionValid() && isNetworkMatching()) {
          const { address } = getStoredSession();
          if (address) {
            setXrplAddress(address);
            setXrplConnected(true);
          } else {
            disconnect();
          }
        } else {
          disconnect();
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("XRPL init failed:", error);
        if (mounted) {
          disconnect();
          setIsInitialized(true);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [disconnect]);

  // Listen for account changes from Crossmark
  useEffect(() => {
    if (!isCrossmarkInstalled || !isInitialized) return;

    const onAccountChanged = (account: { address?: string }) => {
      const address = account?.address;

      if (address && isNetworkMatching()) {
        connect(address);
      } else {
        disconnect();
      }
    };

    sdk.on("accountChanged", onAccountChanged);

    return () => {
      sdk.off("accountChanged", onAccountChanged);
    };
  }, [isCrossmarkInstalled, isInitialized, connect, disconnect]);

  // Monitor network changes and disconnect if network doesn't match
  useEffect(() => {
    if (!xrplConnected || !isCrossmarkInstalled || !isInitialized) return;

    const checkNetwork = () => {
      if (!isNetworkMatching()) {
        disconnect();
      }
    };

    const interval = setInterval(checkNetwork, 2000);

    try {
      sdk.on("networkChanged", checkNetwork);
    } catch (error) {
      console.error("Error listening for network changes:", error);
    }

    return () => {
      clearInterval(interval);
      try {
        sdk.off("networkChanged", checkNetwork);
      } catch (error) {
        console.error("Error removing network change listener:", error);
      }
    };
  }, [xrplConnected, isCrossmarkInstalled, isInitialized, disconnect]);

  // Verify connection when component becomes visible
  useEffect(() => {
    if (!xrplConnected || !isCrossmarkInstalled) return;

    const verifyConnection = () => {
      if (!isNetworkMatching()) {
        disconnect();
        return;
      }

      const { address: storedAddress } = getStoredSession();
      const currentAddress = sdk.sync.getAddress();

      if (currentAddress && currentAddress !== xrplAddress) {
        connect(currentAddress);
      } else if (!currentAddress && !storedAddress) {
        disconnect();
      }
    };

    document.addEventListener("visibilitychange", verifyConnection);
    window.addEventListener("focus", verifyConnection);

    return () => {
      document.removeEventListener("visibilitychange", verifyConnection);
      window.removeEventListener("focus", verifyConnection);
    };
  }, [xrplConnected, isCrossmarkInstalled, xrplAddress, connect, disconnect]);

  // Connect
  const handleXRPLConnect = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);

    try {
      if (!sdk.sync.isInstalled()) {
        alert("Please install Crossmark wallet extension first");
        return false;
      }

      const result = await sdk.methods.signInAndWait();
      const address = result?.response?.data?.address;

      if (!address || !isNetworkMatching()) {
        return false;
      }

      connect(address);
      setIsCrossmarkInstalled(true);
      return true;
    } catch (error) {
      console.error("XRPL connect error:", error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  // Disconnect
  const handleXRPLDisconnect = useCallback((): void => {
    disconnect();
  }, [disconnect]);

  const value = useMemo<XRPLContextType>(
    () => ({
      xrplAddress,
      xrplConnected,
      isConnecting,
      isCrossmarkInstalled,
      handleXRPLConnect,
      handleXRPLDisconnect,
      xrplWallet: sdk,
    }),
    [
      xrplAddress,
      xrplConnected,
      isConnecting,
      isCrossmarkInstalled,
      handleXRPLConnect,
      handleXRPLDisconnect,
    ]
  );

  return <XRPLContext.Provider value={value}>{children}</XRPLContext.Provider>;
};

export const useXRPLContext = () => {
  const context = useContext(XRPLContext);
  if (!context) {
    throw new Error("useXRPLContext must be used within an XRPLProvider");
  }
  return context;
};
