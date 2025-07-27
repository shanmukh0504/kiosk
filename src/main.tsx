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
  dsn: "https://268c0221607054b61682cf7c13d315de@telemetry.garden.finance/3",
  tunnel: "https://telemetry.garden.finance/tunnel",
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  tracePropagationTargets: [
    "localhost",
    "http://10.67.22.114:5173/",
    /^https:\/\/yourserver\.io\/api/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Add error handling for when Sentry is blocked
  beforeSend(event) {
    // Log to console if Sentry is blocked for debugging
    console.log("Sentry event being sent:", event);
    return event;
  },
  // Handle Sentry initialization errors
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
