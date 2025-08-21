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
      await farcasterSdk.actions.ready();
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
