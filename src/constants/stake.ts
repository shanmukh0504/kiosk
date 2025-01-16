import { StakingPosition } from "../store/stakeStore";
import BigNumber from "bignumber.js";

export const SEED_DECIMALS = 18;
export const ETH_BLOCKS_PER_DAY = 7200;
// export const PRIMARY_CHAIN = Number(process.env.NEXT_PUBLIC_STAKING_CHAIN);
export const FEE_DISCOUNT = 0.003;

export const SEPOLIA_CHAIN_ID = 11155111;

export const INFINITE = "INFINITE";

export const MAINNET_SEED_TOKEN_ADDRESS =
  "0x5eed99d066a8CaF10f3E4327c1b3D8b673485eED";

export const DISTRIBUTER_CONTRACT =
  "0xaF29EDdCbFc103AB632e803D625AE91E7515562D";

export const WITHDRAWAL_TIME_LIMIT = 5;
export const SEED_FOR_MINTING_NFT = 21000;
export const MIN_WITHDRAWAL_AMOUNT = "10000000000000000";
export const MIN_STAKE_AMOUNT = 2100;
export const MIN_DEPOSIT = 100;
export const TEN_THOUSAND = 10000;

export const isPermanentStake = (stakePos: StakingPosition) => {
  const totalStakes = new BigNumber(stakePos.amount)
    .dividedBy(10 ** SEED_DECIMALS)
    .dividedBy(2100);

  return stakePos.votes / 7 === Number(totalStakes);
};

export const getNearestMultiple = (value: number) =>
  Math.floor(value / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;

export const isDurationExceeded = (
  time: string,
  hours = 0,
  minutes = 0,
  seconds = 0
) =>
  (new Date().getTime() - new Date(time).getTime()) / 1000 >
  hours * 3600 + minutes * 60 + seconds;
export const DAYS_IN_MONTH = 30;

export const CIRCULATING_SEED_SUPPLY = 12_443_683;
