import { Typography } from "@gardenfi/garden-book";
import { AnimatePresence, motion } from "framer-motion";
import { formatAmount } from "../../utils/utils";
import {
  expandAnimation,
  expandWithDelayAnimation,
} from "../../animations/animations";
import { formatTime } from "../../utils/timeAndFeeComparison/utils";
import { AddressDetails } from "./AddressDetails";

type SwapSavingsProps = {
  timeSaved: number;
  costSaved: number;
  refundAddress: string | undefined;
  receiveAddress: string | undefined;
  isSwapProgress?: boolean;
  showComparison: (type: "time" | "fees") => void;
};

export const SwapSavingsAndAddresses = ({
  timeSaved,
  costSaved,
  refundAddress,
  receiveAddress,
  showComparison
}: SwapSavingsProps) => {
  return (
    <motion.div className="flex flex-col" {...expandWithDelayAnimation}>
      <AnimatePresence mode="wait">
        {(timeSaved > 0 || costSaved > 0) && (
          <motion.div {...expandAnimation}>
            <div className="z-10 mx-4 my-1 h-px" {...expandAnimation}></div>
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
          <div
            className={`mx-4 my-1 h-px ${timeSaved > 0 || costSaved > 0 ? `bg-white` : ``}`}
          ></div>
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
