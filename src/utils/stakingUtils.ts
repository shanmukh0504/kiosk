import { MIN_STAKE_AMOUNT } from "../components/stake/constants";
import { StakingPosition } from "../store/stakeStore";
import BigNumber from "bignumber.js";

export const getMultiplier = (stakePos: StakingPosition): number => {
  const amount = new BigNumber(stakePos.amount).dividedBy(1e18);
  const totalStakes = amount.dividedBy(MIN_STAKE_AMOUNT);
  const multiplier = stakePos.votes / Number(totalStakes);
  return multiplier;
};

export const isPermanentStake = (stakePos: StakingPosition) => {
  const totalStakes = new BigNumber(stakePos.amount)
    .dividedBy(1e18)
    .dividedBy(2100);

  return stakePos.votes / 7 === Number(totalStakes);
};
