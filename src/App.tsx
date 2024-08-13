import { Route, Routes } from "react-router-dom";
import { Swap } from "./swap";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Swap />} />
      </Routes>
    </>
  );
}

export default App;
