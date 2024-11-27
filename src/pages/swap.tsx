import { useLocation } from "react-router-dom";
import { Swap } from "../components/swap/Swap";
import { Meta } from "../layout/Meta";
export const SwapPage = () => {
  const location = useLocation();
  return (
    <div className="w-full h-full">
      <Meta path={location.pathname} />
      <Swap />
    </div>
  );
};
