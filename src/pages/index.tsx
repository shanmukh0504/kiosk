import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { INTERNAL_ROUTES } from "../constants/constants";
import { SwapPage } from "./swap";
import { Quests } from "./quests";
import { useBuildIdCheck } from "../hooks/useBuildIdCheck";

function App() {
  useBuildIdCheck();
  return (
    <Layout>
      <Routes>
        <Route path={INTERNAL_ROUTES.swap.path} element={<SwapPage />} />
        <Route path={INTERNAL_ROUTES.quests.path} element={<Quests />} />
      </Routes>
    </Layout>
  );
}

export default App;
