import { Button, Typography } from "@gardenfi/garden-book"
import { stakeStore, StakingReward } from "../../store/stakeStore"
import { useViewport } from "../../hooks/useViewport";
import { DISTRIBUTER_CONTRACT, TEN_THOUSAND } from "../../constants/stake";
import { distributerABI } from "./abi/distributerClaim";
import { useWriteContract } from "wagmi";
import { useEffect, useState } from "react";
import { useFetchClaimAmount } from "../../hooks/useFetchClaimedAmount";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Hex } from "viem";


export const StakeOverview = () => {
    const { totalStakedAmount, totalVotes, fetchStakeReward, reward, setRewards } = stakeStore();
    const { writeContractAsync } = useWriteContract();
    const formattedAmount = totalStakedAmount === undefined
        ? "0"
        : totalStakedAmount >= TEN_THOUSAND
            ? totalStakedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : totalStakedAmount.toString();

    const { isMobile } = useViewport();
    const [rewardResponse, setRewardResponse] = useState<StakingReward | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isClaimLoading, setIsClaimLoading] = useState(false);
    const [isClaimSuccessful, setIsClaimSuccessful] = useState(false);
    const { address } = useEVMWallet();
    const { data: claimedAmount, refetch } = useFetchClaimAmount(address as Hex);
    useEffect(() => {
        const prefetchReward = async () => {
            setIsLoading(true);
            try {
                const response = await fetchStakeReward(address as Hex);
                setRewardResponse(response);
                await refetch();
                const calculatedReward = response.cumulative_payout_wbtc / Math.pow(10, 8);
                if (claimedAmount !== undefined && claimedAmount !== null) {
                    const remaining = Math.max(0, calculatedReward - Number(claimedAmount) / Math.pow(10, 8))
                    setRewards(remaining);
                } else {
                    setRewards(0);
                }
            } catch (error) {
                console.error("Error fetching rewards:", error);
            }
            setIsLoading(false);
        };

        prefetchReward();
    }, [address, claimedAmount, fetchStakeReward, refetch, setRewards]);

    const handleRewardClick = async () => {
        setIsClaimLoading(true)
        await refetch();
        try {
            const tx = await writeContractAsync({
                address: DISTRIBUTER_CONTRACT,
                abi: distributerABI,
                functionName: "claim",
                args: [rewardResponse?.address, rewardResponse?.cumulative_payout_wbtc, rewardResponse?.nonce, `0x${rewardResponse?.claim_signature}`]
            })
            console.log('Transaction :', tx)
            setIsClaimSuccessful(true);
            await refetch();
            const remainingReward =
                isClaimSuccessful && claimedAmount
                    ? reward - Number(claimedAmount) / Math.pow(10, 8)
                    : 0;
            setRewards(remainingReward)
        } catch (error) {
            console.error('Detailed Error Information:', error);
            setIsClaimSuccessful(false);
        }
        setIsClaimLoading(false)
    }


    return (
        <div className="w-[328px] sm:w-[424px] md:w-[740px] rounded-[15px] bg-opacity-50 gap-4 bg-white mx-auto p-6 flex flex-col">
            <Typography size="h5" weight="bold">Staking Overview</Typography>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center ">
                <div className="flex gap-10 justify-between w-full md:w-[328px]">
                    <div className="flex flex-col gap-1 justify-between">
                        <Typography size={"h5"} weight="bold" className="w-[70px]">Staked Seed</Typography>
                        <Typography size={isMobile ? "h3" : "h2"} weight="medium" className="w-[70px]">{isLoading ? "Loading..." : formattedAmount}</Typography>
                    </div>
                    <div className="flex flex-col gap-1 justify-between">
                        <Typography size={"h5"} weight="bold" >Votes</Typography>
                        <Typography size={isMobile ? "h3" : "h2"} weight="medium" className="w-[50px]">{isLoading ? "Loading..." : totalVotes !== undefined ? totalVotes : 0}</Typography>
                    </div>
                    <div className="flex flex-col gap-1 justify-between">
                        <Typography size={"h5"} weight="bold" className="!text-rose">Staking rewards</Typography>
                        <Typography size={isMobile ? "h3" : "h2"} weight="medium" className="w-[200px] !text-rose">{isLoading
                            ? "Loading..."
                            : isClaimSuccessful
                                ? `${reward} WBTC`
                                : `${reward} WBTC`}</Typography>
                    </div>
                </div>
                <Button
                    variant={isClaimLoading || reward === 0 ? "disabled" : "primary"}
                    size="sm"
                    className={`w-full md:w-[120px] ${isClaimLoading || reward === 0 ? "transition-colors duration-500 flex items-center justify-center self-center" : ""}`}
                    onClick={handleRewardClick} disabled={isClaimLoading || isLoading || reward === 0} >
                    {isClaimLoading ? "Claiming..." : "Claim"}
                </Button>
            </div>
        </div>
    )
}