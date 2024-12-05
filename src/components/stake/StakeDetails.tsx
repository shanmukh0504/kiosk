import { Button, KeyboardDownIcon, KeyboardUpIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore, StakingPosition } from "../../store/stakeStore"
import { FC, useState } from "react";
import { formatAmount } from "../../utils/utils";
import infinity from "../../../public/infinite.svg";
import { ETH_BLOCKS_PER_DAY, isPermanentStake, SEED_DECIMALS, TEN_THOUSAND } from "../../constants/stake";
import { StakeInfoCard } from "./StakeInfoCard";
import { getMultiplier } from "../../utils/stakingUtils";
import { modalNames, modalStore } from "../../store/modalStore";
type props = {
    stakePos: StakingPosition;
}
export const StakeDetails: FC<props> = ({ stakePos }) => {
    const [showDetails, setShowDetails] = useState(false);
    const stakeAmount = formatAmount(stakePos.amount, SEED_DECIMALS, 8);
    const formattedAmount = stakeAmount >= TEN_THOUSAND
        ? stakeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : stakeAmount.toString();

    const isPermaStake = isPermanentStake(stakePos);
    const daysPassedSinceStake = Math.floor(
        (new Date().getTime() - new Date(stakePos.stakedAt).getTime()) /
        (1000 * 3600 * 24)
    );
    const expiryInDays = Math.floor(
        (stakePos.expiry - stakePos.lastStakedAtBlock) / ETH_BLOCKS_PER_DAY
    );

    const stakeStartDate = new Date(stakePos.stakedAt);
    const stakeEndDate = new Date();
    stakeEndDate.setDate(stakeEndDate.getDate() + (expiryInDays - daysPassedSinceStake));
    const stakeEndDateString = stakeEndDate.toISOString().split("T")[0].replaceAll("-", "/");

    const multiplier = getMultiplier(stakeEndDate, stakeStartDate);

    const currentDate = new Date();
    const hasExpired = currentDate > stakeEndDate;

    const { setStakeToExtend, setIsExtend, setIsStake, setInputAmount } = stakeStore();
    const { setOpenModal } = modalStore();

    const handleExtend = () => {
        setInputAmount(stakeAmount.toString())
        setStakeToExtend(stakePos);
        setIsExtend(true);
        setIsStake(false);
        setOpenModal(modalNames.stakeSeed);
    }

    return (
        <div className="py-4 flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <div className="flex gap-8">
                    <Typography size="h3" weight="medium">{formattedAmount} SEED</Typography>
                    <Typography size="h4" weight="medium" className="flex items-center">
                        {hasExpired ? (
                            "Expired"
                        ) : (
                            <>
                                {isPermaStake ? (
                                    <img src={infinity} alt="infinity" className="mr-2" />
                                ) : (
                                    `${daysPassedSinceStake}/${expiryInDays}`
                                )}
                                <span className="ml-2">days</span>
                            </>
                        )}
                    </Typography>

                    <Typography size="h4" weight="medium" >
                        {stakePos.votes} Votes
                    </Typography>
                </div>
                {showDetails ? <KeyboardUpIcon className="mr-2" onClick={() => setShowDetails((p) => !p)} /> : <KeyboardDownIcon className="mr-2" onClick={() => setShowDetails((p) => !p)} />}
            </div>
            {
                showDetails && (
                    <div className="flex flex-col md:flex-row gap-4 justify-between ">
                        <div className="flex gap-10">
                            <StakeInfoCard title={"Rewards"} value={"0.018BTC"} isStakePos />
                            <StakeInfoCard title={"Multiplier"} value={`${multiplier}x`} isStakePos />
                            <StakeInfoCard title={"APY"} value={"108%"} isStakePos />
                            <StakeInfoCard title={"EndDate"} value={`${stakeEndDateString}`} isStakePos />
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleExtend}>Extend</Button>
                    </div>
                )
            }
            <div className="border border-white w-full"></div>
        </div >
    )
}