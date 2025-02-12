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
import { RewardsToolTip } from "../shared/RewardsToolTip";

type props = {
  stakePos: StakingPosition;
};

export const StakeDetails: FC<props> = ({ stakePos }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { setOpenModal } = modalStore();
  const { stakeApys, stakeRewards } = stakeStore();

  const isPermaStake = stakePos.isPerma;
  const isExtendable =
    !isPermaStake && stakePos.status === StakePositionStatus.staked;
  const isExpired = stakePos.status === StakePositionStatus.expired;

  const stakeReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id].accumulatedCBBTCRewards || 0,
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
  const reward = Number(
    stakeRewards?.stakewiseRewards[stakePos.id].accumulatedRewardsUSD
  ).toFixed(2);

  const handleExtend = () => {
    setOpenModal(modalNames.manageStake, {
      extend: {
        isExtend: true,
        stakingPosition: stakePos,
      },
    });
  };

  return (
    <div
      className="flex cursor-pointer flex-col gap-5 py-5"
      onClick={() => setShowDetails((p) => !p)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
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
            <div className="flex flex-col gap-4 sm:gap-10 md:flex-row">
              <div className="flex gap-10">
                <StakeStats
                  title={"Multiplier"}
                  value={`${multiplier}x`}
                  size="xs"
                  className="w-[120px]"
                />
              </div>
              <div className="flex items-center gap-10">
                <StakeStats
                  title={"EndDate"}
                  value={stakeEndDateString}
                  size="xs"
                  className="w-[120px]"
                />
                {stakeApy ? (
                  <StakeStats
                    title={"APY"}
                    value={`${stakeApy || 0} %`}
                    size="xs"
                  />
                ) : null}
                <div
                  className="relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <StakeStats
                    title={"Rewards"}
                    value={`~$${reward}`}
                    size="xs"
                  />

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute top-12 z-50 mx-auto flex w-max flex-col sm:absolute sm:left-[calc(100%+15px)] sm:top-[10px] sm:-translate-x-1/2 sm:flex-col-reverse"
                      >
                        <RewardsToolTip seed={seedReward} cbBtc={stakeReward} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {isExtendable && (
              <Button variant="secondary" size="sm" onClick={handleExtend}>
                Extend
              </Button>
            )}
            {isExpired && <UnstakeAndRestake stakePos={stakePos} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
