import { stakeStore } from "../../store/stakeStore";
import { SEED_DECIMALS } from "../../constants/stake";
import { useRef } from "react";
import { formatAmount } from "../../utils/utils";
import { AnimatePresence, motion } from "framer-motion";
import { OverviewStats } from "./shared/OverviewStats";
import { RewardsToolTip } from "./shared/RewardsToolTip";

const animation = {
  initial: {
    opacity: 0,
    y: -20,
    height: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      delay: 0.2,
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    height: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export const StakeOverview = () => {
  const statRef = useRef<HTMLDivElement>(null);
  const { totalStakedAmount, totalVotes, stakeRewards, stakePosData } =
    stakeStore();

  const calculatedRewardsUSD = stakePosData?.reduce((total, stakePos) => {
    const cbbtcRewardUSD = formatAmount(
      stakeRewards?.stakewiseRewards?.[stakePos.id]
        ?.accumulatedCBBTCRewardsUSD ?? 0,
      0,
      5
    );
    const seedRewardUSD = formatAmount(
      stakeRewards?.stakewiseRewards?.[stakePos.id]
        ?.accumulatedSeedRewardsUSD ?? 0,
      0,
      5
    );
    return total + Number(cbbtcRewardUSD) + Number(seedRewardUSD);
  }, 0);

  const formattedAmount =
    totalStakedAmount === undefined
      ? "0"
      : totalStakedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <motion.div
      variants={animation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="overflow-hidden"
      style={{ transformOrigin: "top" }}
      data-testid="stake-overview"
    >
      <div
        className="mx-auto flex w-[328px] flex-col gap-5 bg-white/25 p-4 backdrop-blur-[20] sm:w-[460px] md:w-[740px]"
        data-testid="stake-overview-card"
      >
        <div className="flex items-start justify-between gap-4 sm:items-center">
          <div
            className="grid grid-cols-[90px_90px_90px] gap-5 px-2 sm:gap-[66px]"
            data-testid="stake-overview-stats"
          >
            <OverviewStats title={"Total SEED"} value={formattedAmount} />
            <AnimatePresence>
              <OverviewStats
                title={"Total rewards"}
                value={`$${formatAmount(Number(calculatedRewardsUSD), 0, 2) || 0}`}
                info
                toolTip={
                  <RewardsToolTip
                    seed={formatAmount(
                      stakeRewards?.totalSeedReward ?? 0,
                      SEED_DECIMALS,
                      4
                    )}
                    cbBtc={formatAmount(
                      Number(
                        stakeRewards?.rewardResponse.cumulative_rewards_cbbtc ??
                          0
                      ),
                      8
                    )}
                  />
                }
                targetRef={statRef}
                className="sm:w-fit"
              />
            </AnimatePresence>
            <OverviewStats
              title={"Total Votes"}
              value={totalVotes !== undefined ? totalVotes : 0}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
