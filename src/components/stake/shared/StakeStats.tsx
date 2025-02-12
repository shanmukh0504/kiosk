import { Typography } from "@gardenfi/garden-book";
import { AnimatePresence, motion } from "framer-motion";
import { FC, ReactNode } from "react";
import { RewardsToolTip } from "./RewardsToolTip";

type props = {
  title: ReactNode;
  value: ReactNode;
  size?: "xs" | "sm" | "md";
  isPink?: boolean;
  className?: string;
  showTooltip?: boolean;
  seedReward?: number;
  stakeReward?: number;
};

export const StakeStats: FC<props> = ({
  title,
  value,
  size = "sm",
  isPink = false,
  showTooltip = false,
  seedReward,
  stakeReward,
  className,
}) => {
  const textColor = isPink ? "!text-rose" : "!text-dark-grey";
  const titleSize = size === "xs" ? "h5" : size === "sm" ? "h5" : "h4";
  const valueSize = "h4";
  const valueBreakpoints =
    size === "md"
      ? ({ xs: "h2", sm: "h1" } as const)
      : size === "sm"
        ? ({ xs: "h3", sm: "h2" } as const)
        : ({ xs: "h4", sm: "h3" } as const);

  return (
    <div
      className={`flex flex-col items-start justify-center gap-y-1 ${className}`}
    >
      <Typography
        size={titleSize}
        breakpoints={{
          xs: "h5",
          sm: titleSize,
        }}
        weight={size === "xs" ? "medium" : "bold"}
        className={`${textColor} whitespace-nowrap`}
      >
        {title}
      </Typography>
      <Typography
        size={valueSize}
        breakpoints={valueBreakpoints}
        weight={size === "xs" ? "medium" : size === "sm" ? "medium" : "bold"}
        className={textColor}
      >
        {value}
      </Typography>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-12 z-50 mx-auto flex w-max flex-col sm:absolute sm:left-[calc(100%+15px)] sm:top-[8.5px] sm:-translate-x-1/2 sm:flex-col-reverse"
          >
            <RewardsToolTip
              seed={seedReward ? seedReward : 0}
              cbBtc={stakeReward ? stakeReward : 0}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
