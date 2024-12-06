import { Typography } from "@gardenfi/garden-book";
import { StakePositionStatus, stakeStore } from "../../store/stakeStore";
import { useEffect } from "react";
import { StakeDetails } from "./StakeDetails";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { formatAmount } from "../../utils/utils";
import { SEED_DECIMALS } from "../../constants/stake";
import { Hex } from "viem";

export const StakePositions = () => {
    const { fetchStakePosData, stakePosData, setTotalStakedAmount, setTotalVotes } = stakeStore();
    const { address } = useEVMWallet();

    useEffect(() => {
        fetchStakePosData(address as Hex);
    }, [address, fetchStakePosData]);

    useEffect(() => {
        const totalStakes = stakePosData?.data?.reduce((acc, item) => {
            if (item.status !== StakePositionStatus.unstaked && item.status !== StakePositionStatus.expired) {
                return acc + formatAmount(item.amount, SEED_DECIMALS, 8);;
            }
            return acc;
        }, 0);

        const totalVotes = stakePosData?.data?.reduce((acc, item) => {
            if (item.status !== StakePositionStatus.unstaked && item.status !== StakePositionStatus.expired) {
                return acc + Number(item.votes);
            }
            return acc;
        }, 0);
        setTotalStakedAmount(Number(totalStakes));
        setTotalVotes(Number(totalVotes));
    }, [stakePosData, setTotalStakedAmount, setTotalVotes]);


    return (
        <div className="w-[328px] sm:w-[424px] md:w-[740px] mb-8 rounded-[15px] bg-opacity-50 bg-white mx-auto p-6 flex flex-col">
            <Typography size="h5" weight="bold">Staking Positions</Typography>
            {stakePosData?.data?.length === 0 ? (
                <Typography size="h5" weight="medium" className="mt-4 text-center">
                    No staking position found
                </Typography>
            ) : (
                stakePosData?.data?.map((item, index) => {
                    if (item.status === StakePositionStatus.unstaked) {
                        return null;
                    } else {
                        const isLast = index === stakePosData.data.length - 1;
                        return <StakeDetails key={index} stakePos={item} isLast={isLast} />;
                    }
                })
            )}
        </div>
    );
};
