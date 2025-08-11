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
import { sdk } from "./utils/coinbaseMiniAppSDK";
import { WalletMonitor } from "./SentryInit.tsx";

const queryClient = new QueryClient();

function AppWithReady() {
  useEffect(() => {
    const sdkInstance = sdk.getSDK() as any;
    if (
      sdkInstance &&
      sdkInstance.actions &&
      typeof sdkInstance.actions.ready === "function"
    ) {
      sdkInstance.actions.ready();
    }
  }, []);
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          <MiniKitProvider apiKey="your-onchainkit-api-key" chain={base}>
            <AppWithReady />
          </MiniKitProvider>
          <WalletMonitor />
          <App />
        </WalletProviders>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
