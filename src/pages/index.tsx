import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { INTERNAL_ROUTES, network } from "../constants/constants";
import { SwapPage } from "./swap";
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
          <Route path={INTERNAL_ROUTES.swap.path} element={<SwapPage />} />
          {/* <Route path={INTERNAL_ROUTES.quests.path} element={<QuestsPage />} /> */}
        </Routes>
      </Layout>
    </GardenProvider>
  );
}

export default App;
