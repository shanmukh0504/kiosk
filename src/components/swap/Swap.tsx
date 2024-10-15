import { useState } from "react";
import { ConfirmSwap } from "./ConfirmSwap";
import { CreateSwap } from "./CreateSwap";
import { SwapDetails } from "../../constants/constants";
import { Toast } from "../../common/Toast";

export const Swap = () => {
  const [toast, _] = useState("Successfully swapped 0.1 BTC to WBTC!");
  const [swap, setSwap] = useState<SwapDetails>();
  const [confirmSwap, setConfirmSwap] = useState<boolean>(false);

  const createSwap = (swap: SwapDetails) => {
    setSwap(swap);
    setConfirmSwap(true);
  }

  return (
    <div className="w-full max-w-[424px] mx-auto px-4 sm:px-0">
      {toast &&
        <div className="mt-6">
          <Toast content={toast} link="https://garden.finance" />
        </div>
      }
      <div
        className={`bg-white/50 rounded-[20px]
        relative overflow-hidden
        ${toast ? "mt-4" : "mt-20"}`}
      >
        {swap && confirmSwap ?
          <ConfirmSwap swap={swap} goBack={() => setConfirmSwap(false)} />
          :
          <CreateSwap swap={swap} createSwap={createSwap} />
        }
      </div>
    </div>
  );
};
