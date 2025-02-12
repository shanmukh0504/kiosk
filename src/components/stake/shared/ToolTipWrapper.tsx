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
        className="absolute top-12 z-50 mx-auto flex w-max flex-col sm:absolute sm:left-[calc(100%+15px)] sm:top-[8.5px] sm:-translate-x-1/2 sm:flex-col-reverse"
      >
        <RewardsToolTip seed={seedReward} cbBtc={cbBtcReward} />
      </motion.div>
    </AnimatePresence>
  );
};
