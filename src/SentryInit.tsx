import * as Sentry from "@sentry/react";
import { useEVMWallet } from "./hooks/useEVMWallet";
import { useStarknetWallet } from "./hooks/useStarknetWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useSolanaWallet } from "./hooks/useSolanaWallet";
import { useEffect } from "react";

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
    return event;
  },
  beforeBreadcrumb(breadcrumb) {
    return breadcrumb;
  },
});

export const WalletMonitor = () => {
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
