import { FC } from "react";
import { DURATION } from "../constants";
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

  return (
    <Button
      variant={loading ? "disabled" : "primary"}
      size="lg"
      onClick={() => handleStake(amount, selectedDuration)}
      loading={loading}
      className="w-full sm:w-fit"
    >
      Stake
    </Button>
  );
};
