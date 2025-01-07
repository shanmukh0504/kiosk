import { Swap } from "../components/swap/Swap";
import { Meta } from "../layout/Meta";

export const SwapPage = () => {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-96px)] h-full flex justify-center items-center">
      <Meta
        title="Garden Finance BTC Bridge: Swap Native Bitcoin"
        description="Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more."
      />
      <Swap />
    </div>
  );
};
