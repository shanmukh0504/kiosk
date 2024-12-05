import { Typography } from "@gardenfi/garden-book"
import { StakeInfoCard } from "./StakeInfoCard"
import { stakeStore } from "../../store/stakeStore"

export const StakeOverview = () => {
    const { totalStakedAmount, totalVotes } = stakeStore();
    return (
        <div className="w-[328px] sm:w-[424px] md:w-[740px] rounded-[15px] bg-opacity-50 bg-white mx-auto p-6 flex flex-col">
            <Typography size="h5" weight="bold">Staking Overview</Typography>
            <div className="flex gap-10">
                <StakeInfoCard title={"Staked Seed"} value={`${totalStakedAmount}`} />
                <StakeInfoCard title={"Votes"} value={`${totalVotes}`} />
                <StakeInfoCard title={"Staking rewards"} value={""} />
            </div>
        </div>
    )
}