import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/index.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import ReactDOM from "react-dom/client";
import { WalletProviders } from "./layout/WalletProviders.tsx";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";
import { useEffect } from "react";
import { sdk as farcasterSdk } from "@farcaster/miniapp-sdk";
import { WalletMonitor } from "./SentryInit.tsx";

const queryClient = new QueryClient();

useEffect(() => {
  const run = async () => {
    try {
      if (farcasterSdk) {
        await farcasterSdk.actions.ready();
      }
    } catch (_err) {
      console.error("Error initializing Farcaster SDK", _err);
    }
  };
  void run();
}, []);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          <MiniKitProvider
            apiKey={import.meta.env.VITE_MINIAPP_KEY}
            chain={base}
          >
            <App />
          </MiniKitProvider>
          <WalletMonitor />
        </WalletProviders>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
