import { FC } from "react";
import { stakeStore } from "../../store/stakeStore";
import { DURATION_MAP } from "../../constants/stake";
import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { StakeInfoCard } from "./StakeInfoCard";
import { StakeSubmissionCard } from "./StakeSubmissionCard";
import { useViewport } from "../../hooks/useViewport";

type props = {
    onClose: () => void;
};
export const StakeSeed: FC<props> = ({ onClose }) => {
    const {
        inputAmount,
        selectedDuration,
    } = stakeStore();
    const { isMobile } = useViewport();
    const multiplier = DURATION_MAP[selectedDuration].votes;
    return (
        <div className="flex flex-col px-1 gap-4 rounded-[20px] top-60 left-auto z-40 transition-left ease-cubic-in-out duration-700">
            <div className="flex justify-between">
                <Typography size="h4" weight="bold">Stake SEED</Typography>
                {!isMobile && (<CloseIcon className="cursor-pointer" onClick={onClose} />)}
            </div>
            <Typography size="h3" weight="medium" className="max-w-[460px]">
                For every 2,100 SEED you will receive 1 vote. Every vote will earn fees. You will receive a multiplier for your votes based on the duration of the stake.
            </Typography>
            <div className="flex items-center align-middle gap-10">
                <StakeInfoCard title={"SEED"} value={inputAmount ? inputAmount : "0"} />
                <StakeInfoCard title={"Multiplier"} value={`${multiplier}x`} />
                <StakeInfoCard title={"APY"} value={"272 %"} isPink />
            </div>
            <StakeSubmissionCard />
        </div>
    )
}