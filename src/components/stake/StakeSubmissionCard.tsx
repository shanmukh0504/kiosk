import { FC } from "react";
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
        loading, inputAmount, selectedDuration
    } = stakeStore();
    const { isPending, data: transactionHash, error, writeContractAsync } = useWriteContract();

    const handleStakeSeed = async () => {
        try {
            const result = await checkAllowanceApproveSeed(inputAmount, selectedDuration);
            console.log("Stake result:", result);
            const tx = result.shouldMintNFT ? await writeContractAsync({
                address: result.config.FLOWER_CONTRACT_ADDRESS as Hex,
                abi: flowerABI,
                functionName: "mint",
                args: [result.config.GARDEN_COBI_FILLER_ADDRESS]
            }) : await writeContractAsync({
                address: result.config.STAKING_CONTRACT_ADDRESS as Hex,
                abi: stakingABI,
                functionName: "vote",
                args: [result.config.GARDEN_COBI_FILLER_ADDRESS, result.stakeUnits, result.lockDuration]
            });
            console.log(tx)
            console.log(isPending)
            console.log(transactionHash)
            console.log(error)
        } catch (error) {
            console.error("Error during staking:", error);
        }
    };


    return (
        <div className="p-4 flex flex-col gap-3 bg-white bg-opacity-25 rounded-2xl">
            <Typography size="h5" weight="bold">Stake Duration</Typography>
            <div className="flex items-center justify-between gap-4">
                <DurationMenu />
                <Button
                    loading={loading}
                    disabled={loading}
                    onClick={handleStakeSeed}
                    size="lg"
                >
                    Stake
                </Button>
            </div>
        </div>
    );
};

