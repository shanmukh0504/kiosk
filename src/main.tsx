import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";

import App from "./pages/index.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import { warningMessage } from "./utils/utils.ts";

import { WalletProviders } from "./layout/WalletProviders.tsx";

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
