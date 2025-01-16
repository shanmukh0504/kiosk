import { maxInt256 } from "viem";
import { network } from "../../constants/constants";

export const DURATION_MAP = {
  6: { votes: 1, lockDuration: 180 },
  12: { votes: 2, lockDuration: 365 },
  24: { votes: 3, lockDuration: 730 },
  48: { votes: 4, lockDuration: 1460 },
  INFINITE: { votes: 7, lockDuration: maxInt256 },
};

export type DURATION = keyof typeof DURATION_MAP;
export const SEED_DECIMALS = 18;
export const INFINITE = "INFINITE";
export const TEN_THOUSAND = 10000;
export const SEED_FOR_MINTING_NFT = 21000;
export const MIN_STAKE_AMOUNT = 2100;

export const STAKING_CHAIN = network === "testnet" ? 11155111 : 42161;
export const ETH_BLOCKS_PER_DAY = 7200;

export const STAKING_CONFIG = {
  11155111: {
    SEED_ADDRESS: "0x5eedb3f5bbA7Da86b0bBa2c6450C52E27e105eeD",
    STAKING_CONTRACT_ADDRESS: "0xC09E6996459D2E9E2bb5F7727341486aDEE325Bf",
    GARDEN_FILLER_ADDRESS: "0x1b7119fe340ff9fFb99492DdE9C9044389BfE387",
    STAKING_CHAIN: 11155111,
    FLOWER_CONTRACT_ADDRESS: "0x4C8589A2A7F85a59B25D58Ff010CC2520118BB20",
    GARDEN_HTLC_ADDR: "0x25F1CADd9f18f4705cd00a2412Eb9de589883184",
    SEED_DECIMALS: 18,
    DISTRIBUTER_CONTRACT: "0x419Cbc03e81EF9322FC822E6CEb81cff5692b551",
    REWARD_TOKEN_ADDRESS: "0xDa9e354bF8174b436C06f372e6ca0caa4c4f6F49",
  },
  42161: {
    SEED_ADDRESS: "",
    STAKING_CONTRACT_ADDRESS: "",
    GARDEN_FILLER_ADDRESS: "",
    STAKING_CHAIN: 42161,
    FLOWER_CONTRACT_ADDRESS: "",
    GARDEN_HTLC_ADDR: "",
    SEED_DECIMALS: 18,
    DISTRIBUTER_CONTRACT: "",
    REWARD_TOKEN_ADDRESS: "",
  },
} as const;
