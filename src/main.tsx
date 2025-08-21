import { StrictMode, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";

import App from "./pages/index.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";

import { WalletProviders } from "./layout/WalletProviders.tsx";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";
import { sdk as farcasterSdk } from "@farcaster/miniapp-sdk";
import { WalletMonitor } from "./SentryInit.tsx";

const queryClient = new QueryClient();

function AppWithReady() {
  useEffect(() => {
    const run = async () => {
      try {
        console.log("Farcaster SDK:", farcasterSdk);
        console.log("Farcaster SDK actions:", farcasterSdk?.actions);
        console.log(
          "Farcaster SDK ready method:",
          farcasterSdk?.actions?.ready
        );
        console.log(
          "Is ready a function?",
          typeof farcasterSdk?.actions?.ready
        );
        console.log("Window location:", window.location.href);
        console.log("User agent:", navigator.userAgent);

        // Check if we're in a Farcaster environment
        const isInFarcaster =
          window.location.href.includes("farcaster") ||
          navigator.userAgent.includes("Farcaster") ||
          window.location.href.includes("warpcast");
        console.log("Detected Farcaster environment:", isInFarcaster);

        if (
          farcasterSdk &&
          farcasterSdk.actions &&
          typeof farcasterSdk.actions.ready === "function"
        ) {
          console.log("Calling sdk.actions.ready()...");
          await farcasterSdk.actions.ready();
          console.log("sdk.actions.ready() completed successfully");
        } else {
          console.warn("Farcaster SDK not available or ready method not found");
          console.log("SDK structure:", {
            hasSdk: !!farcasterSdk,
            hasActions: !!(farcasterSdk && farcasterSdk.actions),
            readyType: typeof farcasterSdk?.actions?.ready,
          });
        }
      } catch (error) {
        console.error("Error calling sdk.actions.ready():", error);
      }
    };
    void run();
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          <MiniKitProvider
            apiKey={import.meta.env.VITE_MINIAPP_KEY}
            chain={base}
          >
            <AppWithReady />
          </MiniKitProvider>
          <WalletMonitor />
        </WalletProviders>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
