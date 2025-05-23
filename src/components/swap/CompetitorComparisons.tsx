import { ArrowLeftIcon, Typography } from "@gardenfi/garden-book";
import { FC, useEffect } from "react";
import { SwapInfo } from "../../common/SwapInfo";
import { swapStore } from "../../store/swapStore";
import {
  formatTime,
  formatTimeDiff,
} from "../../utils/timeAndFeeComparison/utils";
import { motion } from "framer-motion";
import { formatAmount } from "../../utils/utils";
import BigNumber from "bignumber.js";
import { useCompetitorTimeFees } from "../../hooks/useCompetitorTimeFees";

type CompetitorComparisonsProps = {
  hide: () => void;
  isTime?: boolean;
  isFees?: boolean;
  onComparisonUpdate: (maxTimeSaved: number, maxCostSaved: number) => void;
};

export const CompetitorComparisons: FC<CompetitorComparisonsProps> = ({
  hide,
  isTime,
  isFees,
  onComparisonUpdate,
}) => {
  const {
    inputAsset,
    outputAsset,
    inputAmount,
    outputAmount,
    isComparisonVisible,
  } = swapStore();
  const { swapEntriesWithGarden, gardenFee, gardenSwapTime, swapSources } =
    useCompetitorTimeFees({
      isTime: isTime ?? false,
      isFees: isFees ?? false,
      onComparisonUpdate,
    });

  const animationConfig = {
    initial: { x: "100%" },
    animate: { x: isComparisonVisible ? 0 : "100%" },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 0.8,
    },
  };

  const inputAmountInDecimals =
    inputAmount &&
    inputAsset &&
    new BigNumber(inputAmount)
      .multipliedBy(10 ** inputAsset.decimals)
      .toFixed();

  const outputAmountInDecimals =
    outputAmount &&
    outputAsset &&
    new BigNumber(outputAmount)
      .multipliedBy(10 ** outputAsset.decimals)
      .toFixed();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [hide]);

  return (
    <motion.div
      {...animationConfig}
      className="absolute left-0 top-0 z-30 flex h-full w-full flex-col gap-3 rounded-[20px] bg-primary-lighter p-3"
    >
      <div className="flex items-center justify-between p-1">
        <Typography size="h4" weight="bold">
          {isTime ? "Time saved" : isFees ? "Cost saved" : "Saved"}
        </Typography>
        <ArrowLeftIcon className="cursor-pointer" onClick={hide} />
      </div>

      {inputAsset &&
        outputAsset &&
        inputAmountInDecimals &&
        outputAmountInDecimals && (
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
            <SwapInfo
              equalSplit={true}
              sendAsset={inputAsset}
              receiveAsset={outputAsset}
              sendAmount={formatAmount(
                inputAmountInDecimals,
                inputAsset.decimals
              )}
              receiveAmount={formatAmount(
                outputAmountInDecimals,
                outputAsset.decimals
              )}
            />
          </div>
        )}

      <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-4">
        {swapEntriesWithGarden.map(([key, { fee, time }], index) => {
          const source = swapSources.find((s) => s.key === key);
          const feeDiff = (Number(fee) - gardenFee).toFixed(2);

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography size="h5" weight="medium" className="mr-2 w-[20px]">
                  #{index + 1}
                </Typography>
                <div className="flex h-4 w-4 items-center justify-center">
                  {source && source.icon}
                </div>
                <Typography size="h5" weight="medium">
                  {source?.name || key}
                </Typography>
              </div>
              {isTime && (
                <div className="flex gap-6">
                  {key !== "garden" && (
                    <Typography
                      className="!text-rose"
                      size="h5"
                      weight="medium"
                    >
                      {formatTimeDiff(time, gardenSwapTime)}
                    </Typography>
                  )}
                  <Typography
                    className="!flex !w-16 !justify-end"
                    size="h5"
                    weight="medium"
                  >
                    {formatTime(time)}
                  </Typography>
                </div>
              )}
              {isFees && (
                <div className="flex gap-6">
                  {key !== "garden" && (
                    <Typography
                      className="!text-rose"
                      size="h5"
                      weight="medium"
                    >
                      {`${Number(feeDiff) >= 0 ? "+" : "-"}$${Math.abs(Number(feeDiff))}`}
                    </Typography>
                  )}
                  <Typography
                    className="!flex !w-12 !justify-end"
                    size="h5"
                    weight="medium"
                  >
                    {`$${formatAmount(fee, 0, 2)}`}
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
