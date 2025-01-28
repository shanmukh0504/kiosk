import { FC, useState } from "react";
import { modalStore } from "../../../store/modalStore";
import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { viewPortStore } from "../../../store/viewPortStore";
import { StakeStats } from "../shared/StakeStats";
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

  const { setInputAmount, stakingStats } = stakeStore();
  const { modalData } = modalStore();
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

      <div className="p-4 flex flex-col gap-3 bg-white bg-opacity-25 rounded-2xl mb-5 sm:mb-0">
        <Typography size="h5" weight="bold">
          Stake Duration
        </Typography>
        <div className="flex justify-between items-center gap-2">
          <DurationMenu
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
          />
          {isStake && (
            <StakeSubmissionCard
              selectedDuration={selectedDuration}
              amount={amount}
              onClose={handleClose}
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
