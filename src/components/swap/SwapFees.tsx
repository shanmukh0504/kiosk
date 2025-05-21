import { useState, FC, useMemo } from "react";
// import { SwapFeesComparison } from "./SwapFeesComparison";
import { Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";

type SwapFeesProps = {
  tokenPrices: TokenPrices;
};

export const SwapFees: FC<SwapFeesProps> = ({ tokenPrices }) => {
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    price: 0,
  });

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const handleShowComparison = (isOpen: boolean) =>
    setIsShowComparison({ ...showComparison, isOpen });

  return (
    <>
      <div
        className="flex cursor-pointer flex-col gap-3 rounded-2xl bg-white/50 px-4 pb-3 pt-4 transition-[background-color]"
        onClick={() => handleShowComparison(true)}
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div>
          <div className="flex items-center justify-between gap-0">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {fees ? "$" + Number(fees.toFixed(4)) : "--"}
              </Typography>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Typography size="h5" weight="medium">
              Saved
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {/* TODO: Show time saved */}
              </Typography>
              <Typography size="h4" weight="medium">
                --
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
