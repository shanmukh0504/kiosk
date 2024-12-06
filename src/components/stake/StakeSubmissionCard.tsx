import { FC, useState } from "react";
import { stakeStore } from "../../store/stakeStore";
import { Button, Typography } from "@gardenfi/garden-book";
import DurationMenu from "./DurationMenu";
import { checkAllowanceApproveSeed } from "../../utils/stakingUtils";
import { useWriteContract } from "wagmi";
import { flowerABI } from "./abi/flower";
import { stakingABI } from "./abi/staking";
import { Hex } from "viem";

export const StakeSubmissionCard: FC = () => {
    const {
        inputAmount, selectedDuration, isStake, isExtend, stakeToExtend
    } = stakeStore();
    const { writeContractAsync } = useWriteContract();
    const [isLoading, setIsLoading] = useState(false);

    const handleStakeSeed = async () => {
        setIsLoading(true);
        try {
            const result = await checkAllowanceApproveSeed(inputAmount, selectedDuration);
            console.log("Stake result:", result);
            const tx = result.shouldMintNFT
                ? await writeContractAsync({
                    address: result.config.FLOWER_CONTRACT_ADDRESS as Hex,
                    abi: flowerABI,
                    functionName: "mint",
                    args: [result.config.GARDEN_COBI_FILLER_ADDRESS],
                })
                : await writeContractAsync({
                    address: result.config.STAKING_CONTRACT_ADDRESS as Hex,
                    abi: stakingABI,
                    functionName: "vote",
                    args: [
                        result.config.GARDEN_COBI_FILLER_ADDRESS,
                        result.stakeUnits,
                        result.lockDuration,
                    ],
                });
            console.log("Transaction:", tx);
        } catch (error) {
            console.error("Error during staking:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtendStake = async () => {
        setIsLoading(true);
        try {
            const result = await checkAllowanceApproveSeed(inputAmount, selectedDuration);
            console.log("Extend result:", result);
            const tx = await writeContractAsync({
                address: result.config.STAKING_CONTRACT_ADDRESS as Hex,
                abi: stakingABI,
                functionName: "extend",
                args: [stakeToExtend?.id, result.lockDuration],
            });
            console.log("Transaction:", tx);
        } catch (error) {
            console.error("Error during extending the stake:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return isStake ? "Staking..." : "Extending...";
        return isStake ? "Stake" : isExtend ? "Extend" : "Stake";
    };

    return (
        <div className="p-4 flex flex-col gap-3 bg-white bg-opacity-25 rounded-2xl mb-14 sm:mb-12 md:mb-2">
            <Typography size="h5" weight="bold">Stake Duration</Typography>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <DurationMenu />
                <Button
                    onClick={isStake ? handleStakeSeed : isExtend ? handleExtendStake : handleStakeSeed}
                    size="lg"
                    loading={isLoading}
                    className={`w-full sm:w-[120px] ${isLoading ? "transition-colors duration-500 " : ""}`}
                    variant={isLoading ? "disabled" : "primary"}
                    disabled={isLoading}
                >
                    {getButtonText()}
                </Button>
            </div>
        </div>
    );
};
