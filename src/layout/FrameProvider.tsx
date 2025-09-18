import React, { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";

interface FrameContextType {
  isSDKLoaded: boolean;
  context: Context.MiniAppContext | undefined;
}

const FrameContext = React.createContext<FrameContextType | undefined>(
  undefined
);

export function useFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.MiniAppContext>();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setIsSDKLoaded(true);
      console.log("Calling ready");
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  return {
    isSDKLoaded,
    context,
  };
}

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const { isSDKLoaded, context } = useFrame();

  if (!isSDKLoaded) {
    return (
      <div className="relative z-10 h-screen w-screen bg-[#E4EBF2]">
        <div
          className="fixed bottom-0 -z-10 h-full max-h-[612px] w-screen origin-bottom overflow-hidden opacity-60"
          style={{
            background:
              "linear-gradient(180deg, rgba(188, 237, 220, 0) 0%, #BCEDDC 100%)",
          }}
        />
        <div className="loader-shine absolute left-1/2 top-1/2 h-[264px] w-[424px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-gray-200/50"></div>
      </div>
    );
  }
  return (
    <FrameContext.Provider value={{ isSDKLoaded, context }}>
      {children}
    </FrameContext.Provider>
  );
}
