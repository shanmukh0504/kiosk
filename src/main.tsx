import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/index.tsx";
import { WagmiProvider } from "wagmi";
import { config } from "./layout/wagmi/config.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import { GardenProvider } from "@gardenfi/react-hooks";
import { network } from "./constants/constants.tsx";
import ReactDOM from "react-dom/client";

const queryClient = new QueryClient();
ReactDOM.hydrateRoot(
  document.getElementById("root") as HTMLElement, (
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <GardenProvider
            config={{
              store: localStorage,
              environment: network,
            }}
          >
            <App />
          </GardenProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
)
)
