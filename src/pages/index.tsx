import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import {
  Environment,
  INTERNAL_ROUTES,
  environment,
  network,
} from "../constants/constants";
import { SwapPage } from "./swap";
import { StakePage } from "./stake";
import { GardenProvider } from "@gardenfi/react-hooks";
import { useWalletClient } from "wagmi";
import { useAccount } from "@starknet-react/core";
import { Environment as GardenEnvironment } from "@gardenfi/utils";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { rpcStore } from "../store/rpcStore";
import { useEffect } from "react";
// import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useSuiWallet } from "../hooks/useSuiWallet";
import sdk from "@farcaster/miniapp-sdk";

function App() {
  const { data: walletClient } = useWalletClient();
  const { account: starknetWallet } = useAccount();
  const { solanaAnchorProvider } = useSolanaWallet();
  const { suiSelectedWallet } = useSuiWallet();
  const { fetchAndSetRPCs } = rpcStore();
  // const { isFrameReady, setFrameReady } = useMiniKit();

  useEffect(() => {
    fetchAndSetRPCs();
    (async () => {
      await sdk.back.enableWebNavigation();
    })();
  }, []);
  // useEffect(() => {
  //   if (!isFrameReady) {
  //     setFrameReady();
  //   }
  // }, [isFrameReady, setFrameReady]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <GardenProvider
      config={{
        environment:
          environment === Environment.Staging
            ? {
                environment: GardenEnvironment.TESTNET,
                orderbook: import.meta.env.VITE_ORDERBOOK_URL,
                auth: import.meta.env.VITE_AUTH_URL,
                quote: import.meta.env.VITE_QUOTE_URL,
                info: import.meta.env.VITE_INFO_URL,
                evmRelay: import.meta.env.VITE_RELAYER_URL,
                starknetRelay: import.meta.env.VITE_STARKNET_URL,
                solanaRelay: import.meta.env.VITE_SOLANA_URL,
                suiRelay: import.meta.env.VITE_SUI_RELAY_URL,
              }
            : (network as unknown as GardenEnvironment),
        wallets: {
          evm: walletClient,
          starknet: starknetWallet,
          solana: solanaAnchorProvider ?? undefined,
          sui: suiSelectedWallet ?? undefined,
        },
        solanaProgramAddress: {
          native: import.meta.env.VITE_SOLANA_PROGRAM_ADDRESS_NATIVE,
          spl: import.meta.env.VITE_SOLANA_PROGRAM_ADDRESS_SPL,
        },
      }}
      handleSecretManagement={false}
    >
      <Layout>
        <Routes>
          {INTERNAL_ROUTES.swap.path.map((path) => (
            <Route key={path} path={path} element={<SwapPage />} />
          ))}
          {INTERNAL_ROUTES.stake.enabled ? (
            INTERNAL_ROUTES.stake.path.map((path) => (
              <Route key={path} path={path} element={<StakePage />} />
            ))
          ) : (
            <Route path="/stake" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </Layout>
    </GardenProvider>
  );
}

export default App;
