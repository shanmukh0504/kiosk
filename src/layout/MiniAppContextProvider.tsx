import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ReactNode } from "react";
import { base } from "wagmi/chains";

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base as any}
      config={{
        appearance: {
          name: "Garden Finance",
          logo: "",
        },
      }}
    >
      {children}
    </MiniKitProvider>
  );
}
