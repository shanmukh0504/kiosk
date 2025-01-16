import { FC, useState } from "react";
import { modalStore } from "../../../store/modalStore";
import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { viewPortStore } from "../../../store/viewPortStore";
import { StakeStats } from "../shared/StakeStats";
import { DURATION, DURATION_MAP, SEED_DECIMALS } from "../constants";
import { StakeSubmissionCard } from "./StakeSubmissionCard";
import { ExtendOrUnstake } from "./ExtendOrUnstake";
import { stakeStore } from "../../../store/stakeStore";
import { formatAmount } from "../../../utils/utils";

type StakeModalProps = {
  onClose: () => void;
};

export const StakeModal: FC<StakeModalProps> = ({ onClose }) => {
  const [selectedDuration, setSelectedDuration] = useState<DURATION>(6);

  const { setInputAmount, stakingStats } = stakeStore();
  const { modalData } = modalStore();
  const { isMobile } = viewPortStore();

  const isStake = !!modalData?.manageStake?.stake?.isStake;
  const isManage = !!modalData?.manageStake?.manage?.isManage;

  const amount = isStake
    ? Number(modalData.manageStake?.stake?.amount) || 0
    : isManage
    ? formatAmount(
        modalData.manageStake?.manage?.stakingPosition.amount || 0,
        SEED_DECIMALS
      )
    : 0;

  const handleClose = () => {
    setSelectedDuration(6);
    setInputAmount("0");
    onClose();
  };

  return (
    <div className="flex flex-col px-1 gap-4 rounded-[20px] top-60 left-auto z-40 transition-left ease-cubic-in-out duration-700">
      <div className="flex justify-between">
        <Typography size="h4" weight="bold">
          Stake SEED
        </Typography>
        {!isMobile && (
          <CloseIcon className="cursor-pointer" onClick={handleClose} />
        )}
      </div>
      <Typography size="h3" weight="medium" className="max-w-[460px]">
        For every 2,100 SEED you will receive 1 vote. Every vote will earn fees.
        You will receive a multiplier for your votes based on the duration of
        the stake.
      </Typography>
      <div className="flex items-center align-middle gap-10">
        <StakeStats title={"SEED"} value={amount} size="md" />
        <StakeStats
          title={"Multiplier"}
          value={`${DURATION_MAP[selectedDuration].votes}x`}
          size="md"
        />
        <StakeStats
          title={"APY"}
          value={`${stakingStats?.apy || 0} %`}
          isPink
          size="md"
        />
      </div>
      {isStake && (
        <StakeSubmissionCard
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          amount={amount}
          onClose={handleClose}
        />
      )}
      {isManage && modalData.manageStake?.manage?.stakingPosition && (
        <ExtendOrUnstake
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          stakePos={modalData.manageStake?.manage?.stakingPosition}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
