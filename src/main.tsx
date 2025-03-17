import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/index.tsx";
import { WagmiProvider } from "wagmi";
import { config } from "./layout/wagmi/config.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import { network } from "./constants/constants.tsx";
import ReactDOM from "react-dom/client";
import { BTCWalletProvider } from "@gardenfi/wallet-connectors";
import { Network } from "@gardenfi/utils";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BTCWalletProvider network={network as Network} store={localStorage}>
            <App />
          </BTCWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
