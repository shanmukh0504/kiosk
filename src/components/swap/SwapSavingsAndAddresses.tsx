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
import { useRef, useState } from "react";
import { isBitcoin } from "@gardenfi/orderbook";
import { getBitcoinNetwork } from "../../constants/constants";
import { useNetworkFees } from "../../hooks/useNetworkFees";

type SwapSavingsProps = {
  timeSaved: number;
  costSaved: number;
  refundAddress: string | undefined;
  receiveAddress: string | undefined;
  showComparison: (type: "time" | "fees") => void;
};

export const SwapSavingsAndAddresses = ({
  timeSaved,
  costSaved,
  refundAddress,
  receiveAddress,
  showComparison,
}: SwapSavingsProps) => {
  const { outputAsset, outputAmount, inputAsset } = useSwap();
  const [isHovered, setIsHovered] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const network = getBitcoinNetwork();
  const { networkFeesValue, isLoading } = useNetworkFees(network, inputAsset);

  return (
    <motion.div className="flex flex-col" {...expandWithDelayAnimation}>
      <div className="h-full">
        <div className="flex items-center justify-between px-4 pt-1">
          <div className="flex items-center gap-1">
            <Typography size="h5" weight="medium" className="!text-mid-grey">
              Network fee
            </Typography>
          </div>
          <div className="flex gap-5 py-1">
            {isLoading ? (
              <div className="h-4 w-10 animate-pulse rounded bg-gray-100"></div>
            ) : (
              <Typography size="h5" weight="medium">
                {(inputAsset && !isBitcoin(inputAsset.chain)) ||
                Number(networkFeesValue) <= 0
                  ? "Free"
                  : "$" + networkFeesValue}
              </Typography>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <Typography size="h5" weight="medium" className="!text-mid-grey">
              Minimum recieved
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
                  <div className="flex min-w-32 justify-between">
                    <Typography
                      size="h5"
                      weight="medium"
                      className="!text-mid-grey"
                    >
                      Slippage
                    </Typography>
                    <Typography size="h5" weight="medium">
                      0.50%
                    </Typography>
                  </div>
                </TooltipWrapper>
              )}
            </span>
          </div>
          <div className="flex gap-5 py-1">
            <Typography size="h5" weight="medium">
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
        {(timeSaved > 0 || costSaved > 0) && (
          <motion.div {...expandAnimation}>
            <div className="z-10 mt-1" {...expandAnimation}></div>
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
                  <div className="flex gap-5 pb-1">
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
                  <div className="flex gap-5 pt-1">
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
    </motion.div>
  );
};
