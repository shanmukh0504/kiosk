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
import { Network } from "@gardenfi/utils";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { useSuiWallet } from "../hooks/useSuiWallet";
import { useEffect } from "react";
import { balanceStore } from "../store/balanceStore";

function App() {
  const { data: walletClient } = useWalletClient();
  const { account: starknetWallet } = useAccount();
  const { solanaAnchorProvider } = useSolanaWallet();
  const { suiSelectedWallet } = useSuiWallet();
  const { fetchAndSetRPCs } = balanceStore();

  useEffect(() => {
    fetchAndSetRPCs();
  }, [fetchAndSetRPCs]);

  return (
    <GardenProvider
      config={{
        environment:
          environment === Environment.Staging
            ? {
                network: Network.TESTNET,
                auth: import.meta.env.VITE_AUTH_URL,
                relayer: import.meta.env.VITE_RELAYER_URL,
                baseurl: import.meta.env.VITE_BASE_URL,
              }
            : (network as unknown as Network),
        apiKey: import.meta.env.VITE_API_KEY,
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
      setRedeemServiceEnabled={true}
      store={localStorage}
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
