import { useState } from "react";
import { ConfirmSwap } from "./ConfirmSwap";
import { CreateSwap } from "./CreateSwap";
import { SwapDetails } from "../../constants/constants";

export const Swap = () => {
  const [swap, setSwap] = useState<SwapDetails>();
  const [confirmSwap, setConfirmSwap] = useState<boolean>(false);

  const createSwap = (swap: SwapDetails) => {
    setSwap(swap);
    setConfirmSwap(true);
  }

  return (
    <div className="bg-white/50 rounded-[20px]
    relative overflow-hidden
    w-full max-w-[424px] mx-auto mt-10">
      {swap && confirmSwap ?
        <ConfirmSwap swap={swap} goBack={() => setConfirmSwap(false)} />
        :
        <CreateSwap swap={swap} createSwap={createSwap} />
      }
    </div>
  );
};
