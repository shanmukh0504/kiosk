import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";

import App from "./pages/index.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import { warningMessage } from "./utils/utils.ts";

import { WalletProviders } from "./layout/WalletProviders.tsx";
import { assetInfoStore } from "./store/assetInfoStore";
import orderInProgressStore from "./store/orderInProgressStore";
import pendingOrdersStore from "./store/pendingOrdersStore";
import { swapStore } from "./store/swapStore";
import { balanceStore } from "./store/balanceStore";
import { mockWalletStore } from "./store/mockWalletStore";

warningMessage();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          <App />
        </WalletProviders>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.env.VITE_EXPOSE_STORES_FOR_TESTS === "true") {
  const stores = {
    assetInfoStore,
    orderInProgressStore,
    pendingOrdersStore,
    swapStore,
    balanceStore,
    mockWalletStore,
  };
  (window as Window & { __stores?: typeof stores }).__stores = stores;
}
