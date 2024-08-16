import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { INTERNAL_ROUTES } from "../constants/constants";
import { Swap } from "./swap";
import { Quests } from "./quests";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path={INTERNAL_ROUTES.swap.path} element={<Swap />} />
        <Route path={INTERNAL_ROUTES.quests.path} element={<Quests />} />
      </Routes>
    </Layout>
  );
}

export default App;
