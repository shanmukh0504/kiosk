import { InfoIcon, Typography } from "@gardenfi/garden-book";
import { AnimatePresence, motion } from "framer-motion";
import { formatAmount } from "../../utils/utils";
import {
  expandAnimation,
  expandWithDelayAnimation,
} from "../../animations/animations";
import { formatTime } from "../../utils/timeAndFeeComparison/utils";
import { AddressDetails } from "./AddressDetails";
import { useSwap } from "../../hooks/useSwap";
import { TooltipWrapper } from "../../common/ToolTipWrapper";
import { CostToolTip } from "./CostToolTip";
import { useMemo, useRef, useState } from "react";
import { swapStore } from "../../store/swapStore";

type SwapSavingsProps = {
  timeSaved: number;
  costSaved: number;
  refundAddress: string | undefined;
  receiveAddress: string | undefined;
  protocolFee: number;
  networkFeesValue: number;
  showComparison: (type: "time" | "fees") => void;
};

export const SwapSavingsAndAddresses = ({
  timeSaved,
  costSaved,
  refundAddress,
  receiveAddress,
  protocolFee,
  networkFeesValue,
  showComparison,
}: SwapSavingsProps) => {
  const { outputAsset, outputAmount } = useSwap();
  const [isHovered, setIsHovered] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  const { tokenPrices, inputAsset } = swapStore();

  const priceImpact = useMemo(() => {
    if (!tokenPrices) return 0;
    const input = Number(tokenPrices.input);
    const output = Number(tokenPrices.output);
    return (1 - (output + protocolFee) / input) * 100;
  }, [tokenPrices, protocolFee]);

  const fees = useMemo(
    () => protocolFee + networkFeesValue,
    [protocolFee, networkFeesValue]
  );

  return (
    <motion.div className="flex flex-col" {...expandWithDelayAnimation}>
      <div className="h-full">
        <div className="flex items-center justify-between px-4 pt-1">
          <div className="flex items-center gap-1">
            <Typography size="h5" weight="medium" className="!text-mid-grey">
              Fees
            </Typography>
            <span
              ref={targetRef}
              className="inline-block cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <InfoIcon className="h-3 w-3 !fill-mid-grey" />
              {isHovered && inputAsset && outputAsset && (
                <TooltipWrapper targetRef={targetRef}>
                  <CostToolTip
                    networkFee={networkFeesValue}
                    protocolFee={protocolFee}
                  />
                </TooltipWrapper>
              )}
            </span>
          </div>
          <div className="flex gap-5 py-1">
            <Typography size="h4" weight="medium">
              ${formatAmount(fees, 0, 2)}
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Price impact
          </Typography>
          <div className="flex gap-5 py-1">
            <Typography size="h4" weight="medium">
              {priceImpact > 0 && "-"}
              {formatAmount(priceImpact, 0, 2)}%
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Min. received
          </Typography>
          <div className="flex gap-5 py-1">
            <Typography size="h4" weight="medium">
              {outputAmount} {outputAsset?.symbol}
            </Typography>
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {(timeSaved > 0 || costSaved > 0) && (
          <motion.div {...expandAnimation}>
            <div
              className="z-10 mx-4 my-1 h-px bg-white"
              {...expandAnimation}
            ></div>
            {timeSaved > 0 && (
              <motion.div
                key="time-saved"
                {...expandAnimation}
                className="h-full w-full"
              >
                <div
                  className="relative z-10 flex cursor-pointer items-center justify-between gap-0 px-4 transition-all duration-200 ease-in-out hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    showComparison("time");
                  }}
                >
                  <Typography
                    size="h5"
                    weight="medium"
                    className="!text-mid-grey"
                  >
                    Time saved
                  </Typography>
                  <div className="flex gap-5 py-1">
                    <Typography
                      size="h4"
                      weight="medium"
                      className="!text-light-green"
                    >
                      {formatTime(timeSaved)}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}

            {costSaved > 0 && (
              <motion.div
                key="cost-saved"
                {...expandAnimation}
                className="w-full"
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-0 px-4 transition-all duration-200 ease-in-out hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    showComparison("fees");
                  }}
                >
                  <Typography
                    size="h5"
                    weight="medium"
                    className="!text-mid-grey"
                  >
                    Cost saved
                  </Typography>
                  <div className="flex gap-5 py-1">
                    <Typography
                      size="h4"
                      weight="medium"
                      className="!text-light-green"
                    >
                      {`$${formatAmount(costSaved, 0, 2).toFixed(2)}`}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {(receiveAddress || refundAddress) && (
        <>
          <div className={`mx-4 my-1 h-px bg-white`}></div>
          <div className="flex flex-col items-stretch justify-center">
            {receiveAddress && <AddressDetails address={receiveAddress} />}
            {refundAddress && (
              <AddressDetails address={refundAddress} isRefund />
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};
