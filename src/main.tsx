import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/index.tsx";
import { HelmetProvider } from "react-helmet-async";
import { WagmiProvider } from "wagmi";
import { config } from "./layout/wagmi/config.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import { network } from "./constants/constants.tsx";
import { BTCWalletProvider } from "@gardenfi/wallet-connectors";
import { Network } from "@gardenfi/utils";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <BTCWalletProvider
              network={network as Network}
              store={localStorage}
            >
              <App />
            </BTCWalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
