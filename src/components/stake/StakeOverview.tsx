import { KeyboardUpIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { SEED_DECIMALS, TEN_THOUSAND } from "../../constants/stake";
import { useRef } from "react";
import { formatAmount } from "../../utils/utils";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipWrapper } from "./shared/ToolTipWrapper";
import { OverviewStats } from "./shared/OverviewStats";
import { RewardsToolTip } from "./shared/RewardsToolTip";

type StakeOverviewProps = {
  showDetails: boolean;
  setShowDetails: (showDetails: boolean) => void;
};

const Animation = {
  initial: {
    opacity: 0,
    height: 0,
    scale: 0.9,
    y: -10,
  },
  animate: {
    opacity: 1,
    height: "auto",
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      opacity: {
        duration: 0.2,
        delay: 0.2,
      },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      height: {
        duration: 0.2,
        delay: 0.4,
      },
    },
  },
};

export const StakeOverview = ({
  showDetails,
  setShowDetails,
}: StakeOverviewProps) => {
  const statRef = useRef<HTMLDivElement>(null);
  const { totalStakedAmount, totalVotes, stakeRewards, totalGardenerPasses } =
    stakeStore();

  const formattedAmount =
    totalStakedAmount === undefined
      ? "0"
      : totalStakedAmount >= TEN_THOUSAND
        ? totalStakedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : totalStakedAmount.toString();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={Animation}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ transformOrigin: "top" }}
      >
        <div className="mx-auto mt-4 flex w-[328px] flex-col gap-[20px] rounded-[15px] bg-white/50 p-6 backdrop-blur-[20] sm:w-[460px] md:w-[740px]">
          <Typography size="h5" weight="bold">
            Staking overview
          </Typography>
          <div className="flex items-start justify-between gap-4 sm:items-center">
            <div className="flex w-full gap-[32.67px] sm:w-[384px] md:w-[600px] md:gap-[20px]">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8 md:gap-5">
                <OverviewStats
                  title={"Total SEED"}
                  value={formattedAmount}
                  size="sm"
                  className="w-[90px] sm:w-fit md:w-[90px]"
                />
                <OverviewStats
                  title={"Garden pass"}
                  value={totalGardenerPasses}
                  size="sm"
                  className="w-[90px] sm:w-fit md:w-[80px] xl:w-[90px]"
                />
                <OverviewStats
                  title={"Votes"}
                  value={totalVotes !== undefined ? totalVotes : 0}
                  size="sm"
                  className="w-[90px] sm:w-fit md:w-[80px] xl:w-[90px]"
                />
                <AnimatePresence>
                  <OverviewStats
                    title={"Total rewards"}
                    value={`~$${stakeRewards?.accumulatedRewardUSD.toFixed(2) || 0}`}
                    size="sm"
                    info
                    toolTip={
                      <TooltipWrapper targetRef={statRef}>
                        <RewardsToolTip
                          seed={formatAmount(
                            stakeRewards?.totalSeedReward ?? 0,
                            SEED_DECIMALS,
                            4
                          )}
                          cbBtc={formatAmount(
                            Number(
                              stakeRewards?.rewardResponse
                                .cumulative_rewards_cbbtc ?? 0
                            ),
                            8
                          )}
                        />
                      </TooltipWrapper>
                    }
                    targetRef={statRef}
                    className="sm:w-fit md:mr-5 md:w-[100px]"
                  />
                </AnimatePresence>
              </div>
            </div>
            <div
              className="flex h-9 w-9 cursor-pointer items-center justify-center p-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              <KeyboardUpIcon
                className={`transition-transform duration-300 ease-in-out ${showDetails ? "rotate-0" : "-rotate-180"}`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
