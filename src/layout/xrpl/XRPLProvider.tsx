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

export const XRPLProvider: FC<XRPLProviderProps> = ({ children }) => {
  const [xrplAddress, setXrplAddress] = useState<string | undefined>(undefined);
  const [xrplConnected, setXrplConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCrossmarkInstalled, setIsCrossmarkInstalled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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
          setXrplAddress(undefined);
          setXrplConnected(false);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
          setIsInitialized(true);
          return;
        }

        // Check localStorage for previous session
        const storedAddress = localStorage.getItem(STORAGE_KEY);
        const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

        // If we have a stored address and it's recent (within 7 days), restore the session
        if (storedAddress && storedTimestamp) {
          const sessionAge = Date.now() - parseInt(storedTimestamp);
          const sevenDays = 7 * 24 * 60 * 60 * 1000;

          if (sessionAge < sevenDays) {
            setXrplAddress(storedAddress);
            setXrplConnected(true);
          } else {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
            setXrplAddress(undefined);
            setXrplConnected(false);
          }
        } else {
          setXrplAddress(undefined);
          setXrplConnected(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("XRPL init failed:", error);
        if (mounted) {
          setXrplAddress(undefined);
          setXrplConnected(false);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
          setIsInitialized(true);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for account changes from Crossmark
  useEffect(() => {
    if (!isCrossmarkInstalled || !isInitialized) return;

    const onAccountChanged = (account: { address?: string }) => {
      const address = account?.address;

      if (address) {
        setXrplAddress(address);
        setXrplConnected(true);
        localStorage.setItem(STORAGE_KEY, address);
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      } else {
        setXrplAddress(undefined);
        setXrplConnected(false);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      }
    };

    sdk.on("accountChanged", onAccountChanged);

    return () => {
      sdk.off("accountChanged", onAccountChanged);
    };
  }, [isCrossmarkInstalled, isInitialized]);

  // Verify connection when component becomes visible
  useEffect(() => {
    if (!xrplConnected || !isCrossmarkInstalled) return;

    const verifyConnection = () => {
      // When page becomes visible, check if we still have the address
      const storedAddress = localStorage.getItem(STORAGE_KEY);
      const currentAddress = sdk.sync.getAddress();

      // If Crossmark now reports a different address or no address, update our state
      if (currentAddress && currentAddress !== xrplAddress) {
        setXrplAddress(currentAddress);
        localStorage.setItem(STORAGE_KEY, currentAddress);
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      } else if (!currentAddress && !storedAddress) {
        setXrplConnected(false);
        setXrplAddress(undefined);
      }
    };

    document.addEventListener("visibilitychange", verifyConnection);
    window.addEventListener("focus", verifyConnection);

    return () => {
      document.removeEventListener("visibilitychange", verifyConnection);
      window.removeEventListener("focus", verifyConnection);
    };
  }, [xrplConnected, isCrossmarkInstalled, xrplAddress]);

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

      if (!address) {
        return false;
      }

      setXrplAddress(address);
      setXrplConnected(true);
      setIsCrossmarkInstalled(true);
      localStorage.setItem(STORAGE_KEY, address);
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());

      return true;
    } catch (error) {
      console.error("XRPL connect error:", error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect
  const handleXRPLDisconnect = useCallback((): void => {
    setXrplAddress(undefined);
    setXrplConnected(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  }, []);

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
