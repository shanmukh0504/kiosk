import { useState, FC, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { SwapComparison } from "./SwapComparison";

type SwapFeesProps = {
  tokenPrices: TokenPrices;
};

export const SwapFees: FC<SwapFeesProps> = ({ tokenPrices }) => {
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    isTime: false,
    isFees: false,
  });

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const handleShowComparison = (type: "time" | "fees") => {
    setIsShowComparison({
      isOpen: true,
      isTime: type === "time",
      isFees: type === "fees",
    });
  };

  return (
    <>
      <SwapComparison
        visible={showComparison.isOpen}
        hide={() =>
          setIsShowComparison({ isOpen: false, isTime: false, isFees: false })
        }
        isTime={showComparison.isTime}
        isFees={showComparison.isFees}
      />
      <div className="flex cursor-pointer flex-col gap-3 rounded-2xl bg-white/50 pb-3 pt-4 transition-[background-color]">
        <Typography size="h5" weight="bold" className="px-4">
          Details
        </Typography>
        <div>
          <div
            className="flex items-center justify-between gap-0 px-4 hover:bg-white"
            onClick={() => handleShowComparison("time")}
          >
            <Typography size="h5" weight="medium">
              Time saved
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                --
              </Typography>
            </div>
          </div>
          <div
            className="flex items-center justify-between gap-0 px-4 hover:bg-white"
            onClick={() => handleShowComparison("fees")}
          >
            <Typography size="h5" weight="medium">
              Cost saved
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
               --
              </Typography>
            </div>
          </div>
          <div className="flex items-center justify-between gap-0 px-4">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {fees ? "$" + Number(fees.toFixed(4)) : "--"}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
