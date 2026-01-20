import { Typography } from "@gardenfi/garden-book";
import { AnimatePresence, motion } from "framer-motion";
import { formatAmountUsd } from "../../utils/utils";
import {
  expandAnimation,
  expandWithDelayAnimation,
} from "../../animations/animations";
import { formatTime } from "../../utils/timeAndFeeComparison/utils";
import { AddressDetails } from "./AddressDetails";
// import { TooltipWrapper } from "../../common/ToolTipWrapper";
// import { useRef, useState } from "react";
// import { isBitcoin } from "@gardenfi/orderbook";
import { swapStore } from "../../store/swapStore";

type SwapSavingsProps = {
  refundAddress: string | undefined;
  receiveAddress: string | undefined;
  showComparison: (type: "time" | "fees") => void;
  networkFeesValue: number;
};

export const SwapSavingsAndAddresses = ({
  refundAddress,
  receiveAddress,
  showComparison,
  networkFeesValue,
}: SwapSavingsProps) => {
  const { outputAsset, outputAmount, maxTimeSaved, maxCostSaved } = swapStore();
  return (
    <motion.div
      className="flex flex-col"
      {...expandWithDelayAnimation}
      data-testid="swap-details-savings-container"
    >
      <div className="h-full">
        <div className="flex items-center justify-between px-4 pt-1">
          <div className="flex items-center gap-1">
            <Typography size="h5" weight="regular" className="!text-mid-grey">
              Network fee
            </Typography>
          </div>
          <div className="flex gap-5 py-1">
            <Typography
              size="h5"
              weight="regular"
              data-testid="swap-details-network-fee-value"
            >
              {networkFeesValue === 0 ? "Free" : "$" + networkFeesValue}
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <Typography
              size="h5"
              weight="regular"
              className="!text-mid-grey"
              data-testid="swap-details-min-received-value"
            >
              Minimum received
            </Typography>
            {/* <span
              ref={targetRef}
              className="inline-block cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <InfoIcon className="h-3 w-3 !fill-mid-grey" />
              {isHovered && inputAsset && outputAsset && (
                <TooltipWrapper targetRef={targetRef}>
                  <div className="flex min-w-32 justify-between">
                    <Typography
                      size="h5"
                      weight="regular"
                      className="!text-mid-grey"
                    >
                      Slippage
                    </Typography>
                    <Typography size="h5" weight="regular">
                      0.50%
                    </Typography>
                  </div>
                </TooltipWrapper>
              )}
            </span> */}
          </div>
          <div className="flex gap-5 py-1">
            <Typography
              size="h5"
              weight="regular"
              data-testid="swap-details-min-received-value"
            >
              {outputAmount} {outputAsset?.symbol}
            </Typography>
          </div>
        </div>
        {(receiveAddress || refundAddress) && (
          <>
            <div className="flex flex-col items-stretch justify-center">
              {receiveAddress && <AddressDetails address={receiveAddress} />}
              {refundAddress && (
                <AddressDetails address={refundAddress} isRefund />
              )}
            </div>
          </>
        )}
      </div>
      <AnimatePresence mode="wait">
        {(maxTimeSaved > 0 || maxCostSaved > 0) && (
          <motion.div {...expandAnimation}>
            <div className="z-10" {...expandAnimation}></div>
            {maxTimeSaved > 0 && (
              <motion.div
                key="time-saved"
                {...expandAnimation}
                className="h-full w-full"
              >
                <div
                  className="relative z-10 flex cursor-pointer items-center justify-between gap-0 px-4 py-[3px] transition-all duration-200 ease-in-out hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    showComparison("time");
                  }}
                  data-testid="swap-details-time-saved-row"
                >
                  <Typography
                    size="h5"
                    weight="regular"
                    className="!text-mid-grey"
                  >
                    Time saved
                  </Typography>
                  <div className="flex gap-5">
                    <Typography
                      size="h5"
                      weight="regular"
                      className="!text-light-green"
                      data-testid="swap-details-time-saved-value"
                    >
                      {formatTime(maxTimeSaved)}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}

            {maxCostSaved > 0 && (
              <motion.div
                key="cost-saved"
                {...expandAnimation}
                className="w-full"
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-0 px-4 py-[3px] transition-all duration-200 ease-in-out hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    showComparison("fees");
                  }}
                  data-testid="swap-details-cost-saved-row"
                >
                  <Typography
                    size="h5"
                    weight="regular"
                    className="!text-mid-grey"
                  >
                    Cost saved
                  </Typography>
                  <div className="flex gap-5">
                    <Typography
                      size="h5"
                      weight="regular"
                      className="!text-light-green"
                      data-testid="swap-details-cost-saved-value"
                    >
                      {`$${formatAmountUsd(maxCostSaved, 0)}`}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
