import { Route, Routes } from "react-router-dom";
import { Swap } from "./swap";
import { Quests } from "./quests";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Swap />} />
        <Route path="/quests" element={<Quests />} />
      </Routes>
    </>
  );
}

export default App;
