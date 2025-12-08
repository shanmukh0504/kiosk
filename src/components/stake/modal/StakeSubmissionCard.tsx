import { FC } from "react";
import { DURATION, SEED_FOR_MINTING_NFT } from "../constants";
import { Button } from "@gardenfi/garden-book";
import { useStake } from "../../../hooks/useStake";

type StakeSubmissionCardProps = {
  selectedDuration: DURATION;
  amount: number;
};

export const StakeSubmissionCard: FC<StakeSubmissionCardProps> = ({
  selectedDuration,
  amount,
}) => {
  const { handleStake, loading } = useStake();
  const shouldMintNft =
    selectedDuration === "INFINITE" && amount === SEED_FOR_MINTING_NFT;

  const handleStakeClick = () => {
    handleStake(amount, shouldMintNft, selectedDuration);
  };

  return (
    <Button
      variant={loading ? "disabled" : "primary"}
      size="lg"
      onClick={handleStakeClick}
      loading={loading}
      className="w-full sm:w-fit"
    >
      Stake
    </Button>
  );
};
