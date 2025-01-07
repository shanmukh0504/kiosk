import { useState, FC, useMemo, useEffect } from "react";
// import { SwapFeesComparison } from "./SwapFeesComparison";
import { ScaleY, Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { Chain } from "@gardenfi/orderbook";
import AddressDetails from "../../common/AddressDetails";

type SwapCreateDetailsProps = {
  tokenPrices: TokenPrices;
  setIsEditing: (isEditing: boolean) => void;
  isEditing: boolean;
  inputChain: Chain | undefined;
  outputChain: Chain | undefined;
};

export const SwapCreateDetails: FC<SwapCreateDetailsProps> = ({ tokenPrices, setIsEditing, isEditing, inputChain, outputChain }) => {
  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const [triggerFeesAnimation, setTriggerFeesAnimation] = useState(false);

  useEffect(() => {
    if (fees) {
      setTriggerFeesAnimation(false);
      setTimeout(() => setTriggerFeesAnimation(true), 0);
    }
  }, [fees]);

  return (
    <>
      <div
        className="flex flex-col gap-3
        bg-white/50 rounded-2xl
        pt-4 pb-3 px-4"
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div>
          <div className="flex justify-between items-center pb-1">
            <Typography size="h5" weight="medium">
              Slippage
            </Typography>
            <Typography size="h4" weight="medium">
              1%
            </Typography>
          </div>
          <div className="flex justify-between items-center py-1">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <div className="flex gap-5 py-1 mt-[-8px]">
              <ScaleY triggerAnimation={triggerFeesAnimation}>
                <Typography size="h4" weight="medium" >
                  {fees ? "$" + Number(fees.toFixed(4)) : "--"}
                </Typography>
              </ScaleY>
            </div>
          </div>
          <AddressDetails isEditing={isEditing} setIsEditing={setIsEditing} chain={outputChain} />
          <AddressDetails isEditing={isEditing} setIsEditing={setIsEditing} chain={inputChain} isRefund />
        </div>
      </div>
    </>
  );
};
