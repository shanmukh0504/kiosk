import { FC } from "react";
import { RewardsToolTip } from "./RewardsToolTip";
import { AnimatePresence, motion } from "framer-motion";

type TooltipWrapperProps = {
  seedReward: number;
  cbBtcReward: number;
};

export const TooltipWrapper: FC<TooltipWrapperProps> = ({
  seedReward,
  cbBtcReward,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative z-50 mx-auto mt-[-1px] flex w-max flex-col before:absolute before:h-8 before:w-48 before:-translate-x-8 before:-translate-y-16 before:bg-transparent sm:absolute sm:left-[calc(100%+15px)] sm:top-[8.5px] sm:-translate-x-1/2 sm:flex-col-reverse"
      >
        <RewardsToolTip seed={seedReward} cbBtc={cbBtcReward} />
      </motion.div>
    </AnimatePresence>
  );
};
