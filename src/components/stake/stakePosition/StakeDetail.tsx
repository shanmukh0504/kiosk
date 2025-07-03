import {
  // Button,
  InfinityIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useRef, useState } from "react";
import {
  // StakePositionStatus,
  stakeStore,
  StakingPosition,
} from "../../../store/stakeStore";
import { formatAmount } from "../../../utils/utils";
import { ETH_BLOCKS_PER_DAY, SEED_DECIMALS, TEN_THOUSAND } from "../constants";
import { getMultiplier } from "../../../utils/stakingUtils";
// import { UnstakeAndRestake } from "./UnstakeAndRestake";
import { TooltipWrapper } from "../shared/ToolTipWrapper";
import { UnitRewardTooltip } from "../shared/UnitRewardTooltip";
import { motion } from "framer-motion";

type props = {
  key: number;
  stakePos: StakingPosition;
};

export const StakeDetails: FC<props> = ({ key, stakePos }) => {
  const { stakeRewards } = stakeStore();
  const [hovered, setHovered] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const isPermaStake = stakePos.isPerma;
  // const isExtendable =
  //   !isPermaStake && stakePos.status === StakePositionStatus.staked;
  // const isExpired = stakePos.status === StakePositionStatus.expired;

  const stakeReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedCBBTCRewards || 0,
    8,
    8
  );

  // const stakeApy = Number((stakeApys?.[stakePos.id] || 0).toFixed(2));
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
    <Typography size="h4" weight="medium">
      -
    </Typography>
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

  // const handleExtend = () => {
  //   setOpenModal(modalNames.manageStake, {
  //     extend: {
  //       isExtend: true,
  //       stakingPosition: stakePos,
  //     },
  //   });
  // };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10, height: 0, marginTop: 0 }}
      animate={{
        opacity: 1,
        y: 0,
        height: "auto",
        marginTop: 24,
        transition: { duration: 0.3, delay: 0.1 * key },
      }}
      exit={{
        opacity: 0,
        y: -10,
        height: 0,
        marginTop: 0,
        transition: { duration: 0.3 },
      }}
    >
      <td className="py-3 pr-2 text-left">
        <Typography size="h4" weight="medium">
          {formattedAmount}
        </Typography>
      </td>
      <td className="px-4 py-3 text-left sm:px-2">
        {hasExpired ? (
          "Expired"
        ) : (
          <div className="flex items-center">
            {isPermaStake ? (
              <>
                {/* TODO: Change Infinity Icon */}
                <InfinityIcon className="h-3.5" />
                <Typography size="h4" weight="medium">
                  months
                </Typography>
              </>
            ) : (
              <Typography
                size="h4"
                weight="medium"
                className="flex items-center"
              >
                {daysPassedSinceStake} / {expiryInDays} days
              </Typography>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-left sm:px-2 sm:pl-2">
        <Typography size="h4" weight="medium">
          {stakePos.votes}
        </Typography>
      </td>
      <td className="px-4 py-3 text-left sm:px-2">
        <Typography size="h4" weight="medium">
          {multiplier}x
        </Typography>
      </td>
      <td className="px-4 py-3 text-left sm:px-2">
        <span
          ref={targetRef}
          className="inline-block cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {hovered && (
            <TooltipWrapper offsetX={10} offsetY={9} targetRef={targetRef}>
              <UnitRewardTooltip seed={seedReward} cbBtc={stakeReward} />
            </TooltipWrapper>
          )}
          <Typography size="h4" weight="medium">
            ${reward}
          </Typography>
        </span>
      </td>
      <td className="pl-2 pr-8 pt-3 text-left sm:px-2 sm:pr-0 sm:pt-0">
        <Typography size="h4" weight="medium">
          {stakeEndDateString}
        </Typography>
      </td>
      <td className="mx-1 w-4 cursor-pointer p-1">
        <svg
          width="4"
          height="14"
          viewBox="0 0 4 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 13.0588C1.65625 13.0588 1.36201 12.9363 1.11729 12.6915C0.872431 12.4468 0.75 12.1525 0.75 11.8088C0.75 11.465 0.872431 11.1707 1.11729 10.9259C1.36201 10.6811 1.65625 10.5588 2 10.5588C2.34375 10.5588 2.63799 10.6811 2.88271 10.9259C3.12757 11.1707 3.25 11.465 3.25 11.8088C3.25 12.1525 3.12757 12.4468 2.88271 12.6915C2.63799 12.9363 2.34375 13.0588 2 13.0588ZM2 8.25107C1.65625 8.25107 1.36201 8.12864 1.11729 7.88378C0.872431 7.63905 0.75 7.34482 0.75 7.00107C0.75 6.65732 0.872431 6.36308 1.11729 6.11836C1.36201 5.8735 1.65625 5.75107 2 5.75107C2.34375 5.75107 2.63799 5.8735 2.88271 6.11836C3.12757 6.36308 3.25 6.65732 3.25 7.00107C3.25 7.34482 3.12757 7.63905 2.88271 7.88378C2.63799 8.12864 2.34375 8.25107 2 8.25107ZM2 3.44336C1.65625 3.44336 1.36201 3.321 1.11729 3.07628C0.872431 2.83142 0.75 2.53711 0.75 2.19336C0.75 1.84961 0.872431 1.55537 1.11729 1.31065C1.36201 1.06579 1.65625 0.943359 2 0.943359C2.34375 0.943359 2.63799 1.06579 2.88271 1.31065C3.12757 1.55537 3.25 1.84961 3.25 2.19336C3.25 2.53711 3.12757 2.83142 2.88271 3.07628C2.63799 3.321 2.34375 3.44336 2 3.44336Z"
            fill="#554B6A"
          />
        </svg>
      </td>
    </motion.tr>
    // <div className="flex flex-col gap-5 py-5">
    //   <div className="flex cursor-pointer items-center justify-between">
    //     <div className="flex items-center gap-5">
    //       <Typography
    //         size={"h4"}
    //         breakpoints={{
    //           sm: "h4",
    //           md: "h3",
    //         }}
    //         weight="medium"
    //         className="w-24 md:w-[120px]"
    //       >
    //         {formattedAmount} SEED
    //       </Typography>
    //       <Typography
    //         size={"h4"}
    //         breakpoints={{
    //           sm: "h4",
    //           md: "h3",
    //         }}
    //         weight="medium"
    //         className="flex w-[120px] items-center"
    //       >
    //         {hasExpired ? (
    //           "Expired"
    //         ) : (
    //           <>
    //             {isPermaStake ? (
    //               <InfinityIcon className="h-4" />
    //             ) : (
    //               `${daysPassedSinceStake} / ${expiryInDays}`
    //             )}
    //             <span className="ml-2">days</span>
    //           </>
    //         )}
    //       </Typography>

    //       <Typography size="h4" weight="medium" className="hidden sm:block">
    //         {stakePos.votes} {stakePos.votes === 1 ? "Vote" : "Votes"}
    //       </Typography>
    //     </div>
    //     <KeyboardUpIcon
    //       className={`mr-2 transition-transform duration-300 ease-in-out ${showDetails ? "-rotate-180" : "rotate-0"}`}
    //     />
    //   </div>
    //   <motion.div
    //     className="flex flex-col justify-between gap-4 md:flex-row"
    //     animate={{
    //       marginTop: ["-64px", "0px"],
    //       opacity: ["0%", "100%"],
    //       transition: {
    //         duration: 0.15,
    //         ease: "easeInOut",
    //         opacity: {
    //           delay: 0.1,
    //           duration: 0.15,
    //           ease: "easeInOut",
    //         },
    //       },
    //     }}
    //     exit={{
    //       marginTop: ["0px", "-64px"],
    //       opacity: ["100%", "0%"],
    //       transition: {
    //         duration: 0.15,
    //         ease: "easeInOut",
    //         marginTop: {
    //           duration: 0.2,
    //           ease: "easeInOut",
    //         },
    //         opacity: {
    //           duration: 0.1,
    //         },
    //       },
    //     }}
    //   >
    //     <div className="flex flex-col gap-4 sm:gap-5 md:flex-row">
    //       <div className="flex gap-2 md:gap-10">
    //         <StakeStats
    //           title={`${stakePos.votes === 1 ? "Vote" : "Votes"}`}
    //           value={stakePos.votes}
    //           size="xs"
    //           className="block w-[120px] md:hidden"
    //         />
    //         <StakeStats
    //           title={"APY"}
    //           value={`${stakeApy || 0} %`}
    //           size="xs"
    //           className="w-[120px]"
    //         />
    //       </div>
    //       <div className="flex flex-col gap-4 md:flex-row md:gap-5">
    //         <div className="flex items-center gap-2 md:gap-5">
    //           <StakeStats
    //             title={"Multiplier"}
    //             value={`${multiplier}x`}
    //             size="xs"
    //             className="w-[120px]"
    //           />
    //           <StakeStats
    //             title={"End date"}
    //             value={stakeEndDateString}
    //             size="xs"
    //             className="w-[120px]"
    //           />
    //         </div>

    //         <div className="relative">
    //           <StakeStats
    //             targetRef={targetRef}
    //             title={"Rewards"}
    //             value={`~$${reward}`}
    //             size="xs"
    //             toolTip={
    //               <RewardsToolTip seed={seedReward} cbBtc={stakeReward} />
    //             }
    //           />
    //         </div>
    //       </div>
    //     </div>
    //     {isExtendable ? (
    //       <Button variant="secondary" size="sm" onClick={handleExtend}>
    //         Extend
    //       </Button>
    //     ) : isExpired ? (
    //       <UnstakeAndRestake stakePos={stakePos} />
    //     ) : (
    //       <></>
    //     )}
    //   </motion.div>
    // </div>
  );
};
