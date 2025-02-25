import {
  Button,
  InfinityIcon,
  KeyboardUpIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useState } from "react";
import {
  StakePositionStatus,
  stakeStore,
  StakingPosition,
} from "../../../store/stakeStore";
import { formatAmount } from "../../../utils/utils";
import { ETH_BLOCKS_PER_DAY, SEED_DECIMALS, TEN_THOUSAND } from "../constants";
import { getMultiplier } from "../../../utils/stakingUtils";
import { modalNames, modalStore } from "../../../store/modalStore";
import { StakeStats } from "../shared/StakeStats";
import { UnstakeAndRestake } from "./UnstakeAndRestake";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipWrapper } from "../shared/ToolTipWrapper";

type props = {
  stakePos: StakingPosition;
};

export const StakeDetails: FC<props> = ({ stakePos }) => {
  const [showDetails, setShowDetails] = useState(false);

  const { setOpenModal } = modalStore();
  const { stakeApys, stakeRewards } = stakeStore();

  const isPermaStake = stakePos.isPerma;
  const isExtendable =
    !isPermaStake && stakePos.status === StakePositionStatus.staked;
  const isExpired = stakePos.status === StakePositionStatus.expired;

  const stakeReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedCBBTCRewards || 0,
    8,
    5
  );

  const stakeApy = Number((stakeApys?.[stakePos.id] || 0).toFixed(2));
  const stakeAmount = formatAmount(stakePos.amount, SEED_DECIMALS, 0);
  const formattedAmount =
    stakeAmount >= TEN_THOUSAND
      ? stakeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : stakeAmount.toString();

  const seedReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedSeedRewards ??
      "0",
    SEED_DECIMALS,
    5
  );

  const daysPassedSinceStake = Math.floor(
    (new Date().getTime() - new Date(stakePos.stakedAt).getTime()) /
      (1000 * 3600 * 24)
  );
  const expiryInDays = Math.floor(
    (stakePos.expiry - stakePos.lastStakedAtBlock) / ETH_BLOCKS_PER_DAY
  );
  const stakeEndDate = new Date();
  stakeEndDate.setDate(
    stakeEndDate.getDate() + (expiryInDays - daysPassedSinceStake)
  );
  const stakeEndDateString = isPermaStake ? (
    <InfinityIcon />
  ) : (
    stakeEndDate.toISOString().split("T")[0].replaceAll("-", "/")
  );

  const multiplier = getMultiplier(stakePos);
  const currentDate = new Date();
  const hasExpired = currentDate > stakeEndDate;
  const reward = formatAmount(
    stakeRewards?.stakewiseRewards[stakePos.id]?.accumulatedRewardsUSD || 0,
    0,
    2
  );

  const handleExtend = () => {
    setOpenModal(modalNames.manageStake, {
      extend: {
        isExtend: true,
        stakingPosition: stakePos,
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 py-5">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setShowDetails((p) => !p)}
      >
        <div className="flex items-center gap-5">
          <Typography
            size={"h4"}
            breakpoints={{
              sm: "h4",
              md: "h3",
            }}
            weight="medium"
            className="w-24 md:w-[120px]"
          >
            {formattedAmount} SEED
          </Typography>
          <Typography
            size={"h4"}
            breakpoints={{
              sm: "h4",
              md: "h3",
            }}
            weight="medium"
            className="flex w-[120px] items-center"
          >
            {hasExpired ? (
              "Expired"
            ) : (
              <>
                {isPermaStake ? (
                  <InfinityIcon className="h-4" />
                ) : (
                  `${daysPassedSinceStake} / ${expiryInDays}`
                )}
                <span className="ml-2">days</span>
              </>
            )}
          </Typography>

          <Typography size="h4" weight="medium" className="hidden sm:block">
            {stakePos.votes} {stakePos.votes === 1 ? "Vote" : "Votes"}
          </Typography>
        </div>
        <KeyboardUpIcon
          className={`mr-2 transition-transform duration-300 ease-in-out ${showDetails ? "-rotate-180" : "rotate-0"}`}
        />
      </div>
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="flex flex-col justify-between gap-4 md:flex-row"
            animate={{
              marginTop: ["-64px", "0px"],
              opacity: ["0%", "100%"],
              transition: {
                duration: 0.15,
                ease: "easeInOut",
                opacity: {
                  delay: 0.1,
                  duration: 0.15,
                  ease: "easeInOut",
                },
              },
            }}
            exit={{
              marginTop: ["0px", "-64px"],
              opacity: ["100%", "0%"],
              transition: {
                duration: 0.15,
                ease: "easeInOut",
                marginTop: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.1,
                },
              },
            }}
          >
            <div className="flex flex-col gap-4 sm:gap-5 md:flex-row">
              <div className="flex gap-2 md:gap-10">
                <StakeStats
                  title={`${stakePos.votes === 1 ? "Vote" : "Votes"}`}
                  value={stakePos.votes}
                  size="xs"
                  className="block w-[120px] md:hidden"
                />
                <StakeStats
                  title={"APY"}
                  value={`${stakeApy || 0} %`}
                  size="xs"
                  className="w-[120px]"
                />
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:gap-5">
                <div className="flex items-center gap-2 md:gap-5">
                  <StakeStats
                    title={"Multiplier"}
                    value={`${multiplier}x`}
                    size="xs"
                    className="w-[120px]"
                  />
                  <StakeStats
                    title={"End date"}
                    value={stakeEndDateString}
                    size="xs"
                    className="w-[120px]"
                  />
                </div>

                <div className="relative">
                  <StakeStats
                    title={"Rewards"}
                    value={`~$${reward}`}
                    size="xs"
                    toolTip={
                      <TooltipWrapper
                        seedReward={seedReward}
                        cbBtcReward={stakeReward}
                      />
                    }
                  />
                </div>
              </div>
            </div>
            {isExtendable ? (
              <Button variant="secondary" size="sm" onClick={handleExtend}>
                Extend
              </Button>
            ) : isExpired ? (
              <UnstakeAndRestake stakePos={stakePos} />
            ) : (
              <></>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
