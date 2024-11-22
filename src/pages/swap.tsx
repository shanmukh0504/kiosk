import { Swap } from "../components/swap/Swap";
import { Meta } from "../layout/Meta";

export const SwapPage = () => {
  return (
    <div className="w-full h-full">
      <Meta
        title="Garden Finance BTC Bridge: Swap Native Bitcoin"
        description="Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more."
      />
      <Swap />
    </div>
  );
};
