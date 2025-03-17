import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { INTERNAL_ROUTES, network } from "../constants/constants";
import { SwapPage } from "./swap";
import { StakePage } from "./stake";
import { GardenProvider } from "@gardenfi/react-hooks";
import { useWalletClient } from "wagmi";
import { Environment } from "@gardenfi/utils";
// import { QuestsPage } from "./quests";

function App() {
  const { data: walletClient } = useWalletClient();
  return (
    <GardenProvider
      config={{
        store: localStorage,
        environment: network as Environment,
        walletClient: walletClient,
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
