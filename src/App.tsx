import { Route, Routes } from "react-router-dom";
import { Swap } from "./swap";
import { Quests } from "./quests";
import { INTERNAL_ROUTES } from "./common/constants";
import { Layout } from "./layout/Layout";

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
