import { Route, Routes } from "react-router-dom";
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
import { useTronWallet } from "../hooks/useTronWallet";
import { useXRPLWallet } from "../hooks/useXRPLWallet";

function App() {
  const { data: walletClient } = useWalletClient();
  const { account: starknetWallet } = useAccount();
  const { solanaAnchorProvider } = useSolanaWallet();
  const { suiSelectedWallet } = useSuiWallet();
  const { wallet: tronWallet } = useTronWallet();
  const { xrplWallet } = useXRPLWallet();

  return (
    <GardenProvider
      config={{
        environment:
          environment === Environment.Staging
            ? {
                network: Network.TESTNET,
                baseurl: import.meta.env.VITE_BASE_URL,
              }
            : (network as unknown as Network),
        apiKey: import.meta.env.VITE_API_KEY,
        wallets: {
          evm: walletClient,
          starknet: starknetWallet ?? undefined,
          solana: solanaAnchorProvider ?? undefined,
          sui: suiSelectedWallet ?? undefined,
          tron: tronWallet?.adapter ?? undefined,
          xrpl: xrplWallet ?? undefined,
        },
        solanaProgramAddress: {
          native: import.meta.env.VITE_SOLANA_PROGRAM_ADDRESS_NATIVE,
          spl: import.meta.env.VITE_SOLANA_PROGRAM_ADDRESS_SPL,
        },
      }}
      store={localStorage}
    >
      <Layout>
        <Routes>
          {INTERNAL_ROUTES.swap.path.map((path) => (
            <Route key={path} path={path} element={<SwapPage />} />
          ))}
          {INTERNAL_ROUTES.stake.path.map((path) => (
            <Route key={path} path={path} element={<StakePage />} />
          ))}
        </Routes>
      </Layout>
    </GardenProvider>
  );
}

export default App;
