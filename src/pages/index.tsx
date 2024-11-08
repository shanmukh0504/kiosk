import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { INTERNAL_ROUTES } from "../constants/constants";
import { SwapPage } from "./swap";
import { QuestsPage } from "./quests";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path={INTERNAL_ROUTES.swap.path} element={<SwapPage />} />
        <Route path={INTERNAL_ROUTES.quests.path} element={<QuestsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
