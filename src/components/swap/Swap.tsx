import { useState } from "react";
import { ConfirmSwap } from "./ConfirmSwap";
import { CreateSwap } from "./CreateSwap";
import { ISwapDetails } from "../../constants/constants";

export const Swap = () => {
  const [swap, setSwap] = useState<ISwapDetails>();
  const [confirmSwap, setConfirmSwap] = useState<boolean>(false);

  const createSwap = (swap: ISwapDetails) => {
    setSwap(swap);
    setConfirmSwap(true);
  }

  return (
    // We use a simple boolean state value to switch between the `CreateSwap`
    // and `ConfirmSwap` components
    swap && confirmSwap ?
      <ConfirmSwap swap={swap} goBack={() => setConfirmSwap(false)} />
      :
      <CreateSwap swap={swap} createSwap={createSwap} />
  );
};
