import { Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout.tsx";
import { INTERNAL_ROUTES } from "../constants/constants.tsx";
import { SwapPage } from "./swap.tsx";
// import { QuestsPage } from "./quests";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path={INTERNAL_ROUTES.swap.path} element={<SwapPage />} />
        {/* <Route path={INTERNAL_ROUTES.quests.path} element={<QuestsPage />} /> */}
      </Routes>
    </Layout>
  );
}

export default App;
