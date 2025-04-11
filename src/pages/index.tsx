import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { INTERNAL_ROUTES, network } from "../constants/constants";
import { SwapPage } from "./swap";
import { StakePage } from "./stake";
import { GardenProvider } from "@gardenfi/react-hooks";
import { useWalletClient } from "wagmi";
import { DigestKey, Environment, Siwe, Url } from "@gardenfi/utils";
import { useAccount } from "@starknet-react/core";
import { EvmRelay, Quote, StarknetRelay } from "@gardenfi/core";
// import { QuestsPage } from "./quests";

function App() {
  const { data: walletClient } = useWalletClient();
  const { account: starknetWallet } = useAccount();

  return (
    <GardenProvider
      config={{
        environment: network as Environment,
        // wallets: {
        //   evm: walletClient,
        //   starknet: starknetWallet,
        // },
        htlc: {
          starknet: new StarknetRelay(
            "https://starknet-relayer.hashira.io",
            starknetWallet!
          ),
          evm: new EvmRelay(
            "https://orderbook-stage.hashira.io",
            walletClient!,
            Siwe.fromDigestKey(
              new Url("https://orderbook-stage.hashira.io"),
              DigestKey.generateRandom().val
            )
          ),
        },
        quote: new Quote("https://quote-staging.hashira.io/"),
        api: "https://orderbook-stage.hashira.io",
      }}
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
