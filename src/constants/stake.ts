import { maxInt256 } from "viem";
import { StakingPosition } from "../store/stakeStore";
import BigNumber from "bignumber.js";

export const STAKING_CONFIG = {
  11155111: {
    SEED_ADDRESS: "0x5eedb3f5bbA7Da86b0bBa2c6450C52E27e105eeD",
    STAKING_CONTRACT_ADDRESS: "0xC09E6996459D2E9E2bb5F7727341486aDEE325Bf",
    GARDEN_COBI_FILLER_ADDRESS: "0x1b7119fe340ff9fFb99492DdE9C9044389BfE387",
    STAKING_CHAIN: 11155111,
    FLOWER_CONTRACT_ADDRESS: "0x4C8589A2A7F85a59B25D58Ff010CC2520118BB20",
    CIRCULATING_SEED_SUPPLY: 50000000000,
    FEE_HUB: "0x788014fa7A0572dC1f7dBEf7667a4cfe4775dDd4",
    GARDEN_HTLC_ADDR: "0x25F1CADd9f18f4705cd00a2412Eb9de589883184",
    RPC: "https://sepolia.infura.io/v3/c24c1e1e6de4409485f1a0ca83662575",
  },
};

export type STAKING_CONFIG_CHAIN = keyof typeof STAKING_CONFIG;

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

export const DURATION_MAP = {
  6: { votes: 1, lockDuration: 180 },
  12: { votes: 2, lockDuration: 365 },
  24: { votes: 3, lockDuration: 730 },
  48: { votes: 4, lockDuration: 1460 },
  INFINITE: { votes: 7, lockDuration: maxInt256 },
};

export type DURATION = keyof typeof DURATION_MAP;
export const WITHDRAWAL_TIME_LIMIT = 5;
export const SEED_FOR_MINTING_NFT = 21000;
export const MIN_WITHDRAWAL_AMOUNT = "10000000000000000";
export const MIN_STAKE_AMOUNT = 2100;
export const MIN_DEPOSIT = 100;
export const TEN_THOUSAND = 10000;

export const isPermanentStake = (stakePos: StakingPosition) => {
  const totalStakes = new BigNumber(stakePos.amount)
    .dividedBy(1e18)
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
