import {
  Button,
  InfinityIcon,
  KeyboardDownIcon,
  KeyboardUpIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { stakeStore, StakingPosition } from "../../../store/stakeStore";
import { formatAmount } from "../../../utils/utils";
import { ETH_BLOCKS_PER_DAY, SEED_DECIMALS, TEN_THOUSAND } from "../constants";
import { getMultiplier } from "../../../utils/stakingUtils";
import { modalNames, modalStore } from "../../../store/modalStore";
import { StakeStats } from "../shared/StakeStats";

type props = {
  stakePos: StakingPosition;
};

export const StakeDetails: FC<props> = ({ stakePos }) => {
  const [showDetails, setShowDetails] = useState(false);

  const { setOpenModal } = modalStore();
  const { stakeApys } = stakeStore();

  const stakeApy = Number((stakeApys?.[stakePos.id] || 0).toFixed(2));

  const stakeAmount = formatAmount(stakePos.amount, SEED_DECIMALS, 8);
  const formattedAmount =
    stakeAmount >= TEN_THOUSAND
      ? stakeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : stakeAmount.toString();

  const isPermaStake = stakePos.isPerma;
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

  const handleManage = () => {
    setOpenModal(modalNames.manageStake, {
      manage: {
        isManage: true,
        stakingPosition: stakePos,
      },
    });
  };

  return (
    <div
      className="py-5 flex flex-col gap-5 cursor-pointer"
      onClick={() => setShowDetails((p) => !p)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Typography
            size={"h4"}
            breakpoints={{
              sm: "h4",
              md: "h3",
            }}
            weight="medium"
            className="w-[120px]"
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
            className="flex items-center w-[120px]"
          >
            {hasExpired ? (
              "Expired"
            ) : (
              <>
                {isPermaStake ? (
                  <InfinityIcon />
                ) : (
                  `${daysPassedSinceStake} / ${expiryInDays}`
                )}
                <span className="ml-2">days</span>
              </>
            )}
          </Typography>

          <Typography
            size="h4"
            weight="medium"
            className="pl-10 hidden sm:block"
          >
            {stakePos.votes} {stakePos.votes === 1 ? "Vote" : "Votes"}
          </Typography>
        </div>
        {showDetails ? (
          <KeyboardUpIcon className="mr-2" />
        ) : (
          <KeyboardDownIcon className="mr-2" />
        )}
      </div>
      {showDetails && (
        <div className="flex flex-col md:flex-row gap-4 justify-between ">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-10">
            <div className=" flex gap-10">
              {/* <StakeStats
                title={"Rewards"}
                value={"0.018BTC"}
                className={"w-[120px] md:w-[76px]"}
              /> */}
              <StakeStats
                title={"Multiplier"}
                value={`${multiplier}x`}
                size="xs"
              />
              {stakeApy ? (
                <StakeStats
                  title={"APY"}
                  value={`${stakeApy || 0} %`}
                  size="xs"
                />
              ) : null}
            </div>
            <div className=" flex gap-10">
              <StakeStats
                title={"EndDate"}
                value={stakeEndDateString}
                size="xs"
              />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleManage}>
            Manage
          </Button>
        </div>
      )}
    </div>
  );
};
