import { StrictMode, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/index.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@gardenfi/garden-book/style.css";
import ReactDOM from "react-dom/client";
import { WalletProviders } from "./layout/WalletProviders.tsx";

import * as Sentry from "@sentry/react";
import { useEVMWallet } from "./hooks/useEVMWallet";
import { useStarknetWallet } from "./hooks/useStarknetWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useSolanaWallet } from "./hooks/useSolanaWallet";

Sentry.init({
  dsn: "https://2199f797da19907c4a034e1018be6837@telemetry.garden.finance/5",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Track Garden Finance API endpoints
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/testnet\.api\.hashira\.io/,
    /^https:\/\/.*\.garden\.finance/,
  ],

  beforeSend(event) {
    console.log("Sentry event being sent:", event);
    return event;
  },
  beforeBreadcrumb(breadcrumb) {
    return breadcrumb;
  },
});

const WalletMonitor = () => {
  const { address: evmAddress, isConnected: evmConnected } = useEVMWallet();
  const { starknetAddress, starknetStatus } = useStarknetWallet();
  const { account: btcAddress, provider: btcProvider } = useBitcoinWallet();
  const { solanaAddress, solanaConnected } = useSolanaWallet();

  useEffect(() => {
    let userAddress = "anonymous-user";

    if (evmConnected && evmAddress) {
      userAddress = evmAddress;
    } else if (starknetStatus === "connected" && starknetAddress) {
      userAddress = starknetAddress;
    } else if (btcProvider && btcAddress) {
      userAddress = btcAddress;
    } else if (solanaConnected && solanaAddress) {
      userAddress = solanaAddress;
    }

    Sentry.setUser({
      id: userAddress,
    });
  }, [
    evmConnected,
    evmAddress,
    starknetStatus,
    starknetAddress,
    btcProvider,
    btcAddress,
    solanaConnected,
    solanaAddress,
  ]);

  return null;
};

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          <WalletMonitor />
          <App />
        </WalletProviders>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
