import { useState, FC, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { SwapComparison } from "./SwapComparison";

type SwapDetailsProps = {
  tokenPrices: TokenPrices;
  timeEstimate: string;
};

export const SwapDetails: FC<SwapDetailsProps> = ({
  tokenPrices,
  timeEstimate,
}) => {
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);

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
        gardenFee={fees}
        gardenSwapTime={timeEstimate}
        onComparisonUpdate={(time, cost) => {
          setMaxTimeSaved(time);
          setMaxCostSaved(cost);
        }}
      />
      <div className="flex flex-col gap-3 rounded-2xl bg-white/50 pb-3 pt-4 transition-[background-color]">
        <Typography size="h5" weight="bold" className="px-4">
          Details
        </Typography>
        <div>
          <div
            className={`flex items-center justify-between gap-0 px-4 ${
              maxTimeSaved > 0
                ? "cursor-pointer hover:bg-white"
                : "pointer-events-none"
            }`}
            onClick={() => maxTimeSaved > 0 && handleShowComparison("time")}
          >
            <Typography size="h5" weight="medium">
              Time saved
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {maxTimeSaved > 0
                  ? `${Math.floor(maxTimeSaved / 60)}m ${maxTimeSaved % 60}s`
                  : "--"}
              </Typography>
            </div>
          </div>
          <div
            className={`flex items-center justify-between gap-0 px-4 ${
              maxCostSaved > 0
                ? "cursor-pointer hover:bg-white"
                : "pointer-events-none"
            }`}
            onClick={() => maxCostSaved > 0 && handleShowComparison("fees")}
          >
            <Typography size="h5" weight="medium">
              Cost saved
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {maxCostSaved > 0 ? `$${maxCostSaved.toFixed(2)}` : "--"}
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
