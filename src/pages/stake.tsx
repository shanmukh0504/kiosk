import { Stake } from "../components/stake/Stake";
import { Meta } from "../layout/Meta";

export const StakePage = () => {
  return (
    <div className="h-full w-full">
      <Meta
        title="Garden Finance BTC Bridge: Swap Native Bitcoin"
        description="Effortlessly bridge native Bitcoin to chains like Solana, Ethereum, Base, Arbitrum, Avalanche, and more."
      />
      <Stake />
    </div>
  );
};
