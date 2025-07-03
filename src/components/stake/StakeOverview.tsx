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
    <motion.div
      animate={{
        opacity: ["0%", "100%"],
        height: ["0%", "100%"],
        marginTop: ["0%", "24px"],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          once: true,
          opacity: {
            duration: 0.3,
            delay: 0.4,
          },
        },
      }}
      exit={{
        marginTop: ["24px", "0%"],
        opacity: ["100%", "0%"],
        height: ["100%", "0%"],
        transition: {
          duration: 0.3,
        },
      }}
      style={{ transformOrigin: "top" }}
    >
      <div className="mx-auto flex w-[328px] flex-col gap-[20px] rounded-[15px] bg-white/50 p-6 backdrop-blur-[20] sm:w-[424px] md:w-[740px]">
        <Typography size="h5" weight="bold">
          Staking positions
        </Typography>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-[32.67px] sm:w-[384px] sm:flex-row md:w-[600px] md:gap-[20px]">
            <div className="flex gap-4 sm:gap-8 md:gap-5">
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
  );
};
