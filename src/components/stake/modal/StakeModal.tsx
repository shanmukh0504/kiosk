import { FC, useEffect, useState } from "react";
import { modalStore } from "../../../store/modalStore";
import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { viewPortStore } from "../../../store/viewPortStore";
import { RewardStats } from "../shared/RewardStats";
import { DURATION, DURATION_MAP, SEED_DECIMALS } from "../constants";
import { StakeSubmissionCard } from "./StakeSubmissionCard";
import { ExtendStake } from "./ExtendStake";
import { stakeStore } from "../../../store/stakeStore";
import { formatAmount } from "../../../utils/utils";
import DurationMenu from "../shared/DurationMenu";
import { Restake } from "./Restake";

type StakeModalProps = {
  onClose: () => void;
};

export const StakeModal: FC<StakeModalProps> = ({ onClose }) => {
  const [selectedDuration, setSelectedDuration] = useState<DURATION>(6);

  const { setAmount, stakingStats } = stakeStore();
  const { modalData, modalName } = modalStore();
  const { isMobile } = viewPortStore();

  const isStake = !!modalData?.manageStake?.stake?.isStake;
  const isExtend = !!modalData?.manageStake?.extend?.isExtend;
  const isRestake = !!modalData?.manageStake?.restake?.isRestake;

  const amount = isStake
    ? Number(modalData.manageStake?.stake?.amount) || 0
    : isExtend
      ? formatAmount(
          modalData.manageStake?.extend?.stakingPosition.amount || 0,
          SEED_DECIMALS
        )
      : isRestake
        ? formatAmount(
            modalData.manageStake?.restake?.stakingPosition.amount || 0,
            SEED_DECIMALS
          )
        : 0;

  const getDurationFromVotes = (votes: number | undefined): DURATION => {
    if (!votes) return 6;
    for (const [key, value] of Object.entries(DURATION_MAP)) {
      if (value.votes === votes) {
        return Number(key) as DURATION;
      }
    }
    return 6;
  };

  const handleClose = () => {
    setSelectedDuration(6);
    setAmount(0);
    onClose();
  };

  useEffect(() => {
    setSelectedDuration(
      getDurationFromVotes(
        modalData.manageStake?.extend?.stakingPosition?.votes
      )
    );
  }, [modalData.manageStake?.extend?.stakingPosition.votes]);

  return (
    <div className="transition-left left-auto top-60 z-50 flex flex-col gap-4 rounded-[20px] p-3 duration-700 ease-cubic-in-out md:min-w-[576px]">
      <div className="flex justify-between">
        <Typography size="h4" weight="medium">
          Set duration
        </Typography>
        {!isMobile && (
          <CloseIcon className="cursor-pointer" onClick={handleClose} />
        )}
      </div>
      <Typography
        size="h3"
        weight="regular"
        className="max-w-[460px] !leading-5"
      >
        For every 2,100 SEED you will receive 1 vote. Every vote will earn fees.
        You will receive a multiplier for your votes based on the duration of
        the stake.
      </Typography>
      <div className="flex items-center gap-10 align-middle">
        <RewardStats title={"SEED"} weight="medium" value={amount} size="sm" />
        <RewardStats
          title={"Multiplier"}
          value={`${DURATION_MAP[selectedDuration].votes}x`}
          weight="medium"
          size="sm"
        />
        <RewardStats
          title={"APY"}
          value={`${stakingStats?.globalApy || 0} %`}
          weight="medium"
          isPink
          size="sm"
        />
      </div>

      <div className="mb-5 mt-4 flex flex-col gap-3 rounded-2xl bg-white bg-opacity-25 p-4 sm:mb-2">
        <Typography size="h5" weight="regular">
          Stake duration
        </Typography>
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <DurationMenu
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            modalOpen={modalName.manageStake}
          />
          {isStake && (
            <StakeSubmissionCard
              selectedDuration={selectedDuration}
              amount={amount}
            />
          )}
          {isExtend && modalData.manageStake?.extend?.stakingPosition && (
            <ExtendStake
              selectedDuration={selectedDuration}
              stakePos={modalData.manageStake?.extend?.stakingPosition}
              onClose={handleClose}
            />
          )}
          {isRestake && modalData.manageStake?.restake?.stakingPosition && (
            <Restake
              selectedDuration={selectedDuration}
              stakePos={modalData.manageStake?.restake?.stakingPosition}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
