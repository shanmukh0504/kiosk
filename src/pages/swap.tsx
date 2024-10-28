import { Swap } from "../components/swap/Swap";
import { Sidebar } from "../components/sidebar/Sidebar";
import { Meta } from "../layout/Meta";

export const SwapPage = () => {
  return (
    <div className="w-full h-full">
      <Meta
        title="Native Bitcoin Exchange | Garden BTC Bridge"
        description="Experience fast, secure, and trustless BTC bridging across most blockchains, including Arbitrum, Ethereum, Avalanche, Optimism, and Binance."
      />
      <Swap />
      <Sidebar />
    </div>
  );
};
