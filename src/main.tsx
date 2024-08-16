import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi/config.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </WagmiProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
);
