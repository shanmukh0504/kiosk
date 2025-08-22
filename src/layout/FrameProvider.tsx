import type { Context } from "@farcaster/miniapp-sdk";
import sdk from "@farcaster/miniapp-sdk";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type FrameContextValue = {
  context?: Context.MiniAppContext;
  isLoading: boolean;
  isSDKLoaded: boolean;
  isEthProviderAvailable: boolean;
  actions: typeof sdk.actions;
  haptics: typeof sdk.haptics;
};

const FrameProviderContext = createContext<FrameContextValue | undefined>(
  undefined
);

export function useFrame() {
  const ctx = useContext(FrameProviderContext);
  if (!ctx) throw new Error("useFrame must be used within a FrameProvider");
  return ctx;
}

export function FrameProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<Context.MiniAppContext>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const ctx = await sdk.context;
        if (!mounted) return;
        setContext(ctx);
        await sdk.actions.ready({ disableNativeGestures: true });
        console.log("SDK actions.ready resolved successfully");
        if (!mounted) return;
        setIsSDKLoaded(true);
      } catch (e) {
        setIsSDKLoaded(false);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FrameProviderContext.Provider
      value={{
        context,
        isLoading,
        isSDKLoaded,
        isEthProviderAvailable: Boolean(sdk.wallet.ethProvider),
        actions: sdk.actions,
        haptics: sdk.haptics,
      }}
    >
      {children}
    </FrameProviderContext.Provider>
  );
}
