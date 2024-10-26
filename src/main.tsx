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
import { BitcoinNetwork, GardenProvider } from "@gardenfi/react-hooks";
import { API } from "./constants/api.ts";

const queryClient = new QueryClient();
const api = API();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <GardenProvider
              config={{
                orderBookUrl: api.orderbook,
                quoteUrl: api.quote,
                store: localStorage,
                network: BitcoinNetwork.Testnet,
                bitcoinRPCUrl: api.mempool.testnet,
                blockNumberFetcherUrl: api.data.data,
              }}
            >
              <App />
            </GardenProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
);
