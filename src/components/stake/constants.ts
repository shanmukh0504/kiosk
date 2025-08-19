import { maxInt256 } from "viem";
import { network } from "../../constants/constants";
import { Network, Url } from "@gardenfi/utils";
import { Chains } from "@gardenfi/orderbook";

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
export const SEED_FOR_MINTING_NFT = 21000;
export const MIN_STAKE_AMOUNT = 2100;

export const STAKING_CHAIN = network === Network.TESTNET ? 421614 : 42161;
export const REWARD_CHAIN = network === Network.TESTNET ? 84532 : 8453;
export const ETH_BLOCKS_PER_DAY = 7200;

export const STAKING_CONFIG = {
  // arbitrum sepolia
  421614: {
    SEED_ADDRESS: "0x432B43764548c3E47eA65aAdeB91D75C84DBcC2c",
    STAKING_CONTRACT_ADDRESS: "0x43909E5677bC72d0423224d994C2dAFE1342FB2D",
    GARDEN_FILLER_ADDRESS: "0x661bA32eb5f86CaB358DDbB7F264b10c5825e2dd",
    STAKING_CHAIN: 421614,
    FLOWER_CONTRACT_ADDRESS: "0x696659513c11029f72AB9F3FE31BEe858958B342",
    SEED_DECIMALS: 18,
    CHAIN: Chains.arbitrum_sepolia,
  },
  // arbitrum
  42161: {
    SEED_ADDRESS: "0x86f65121804D2Cdbef79F9f072D4e0c2eEbABC08",
    STAKING_CONTRACT_ADDRESS: "0xe2239938ce088148b3ab398b2b77eedfcd9d1afc",
    GARDEN_FILLER_ADDRESS: "0x9dd9c2d208b07bf9a4ef9ca311f36d7185749635",
    STAKING_CHAIN: 42161,
    FLOWER_CONTRACT_ADDRESS: "0x1Ab59ae8BB54700B3C2C2cec4dB2dA26fE825a7D",
    SEED_DECIMALS: 18,
    CHAIN: Chains.arbitrum,
  },
} as const;

export const REWARD_CONFIG = {
  CBBTC: {
    //base_sepolia
    84532: {
      DISTRIBUTER_CONTRACT: "0xe30D56445C80fB42b35407fDE3cD1Bd960Ac9065",
      REWARD_TOKEN_ADDRESS: "0x868D08C137ff590BF70D368408B72f748eFbe483",
      REWARD_TOKEN_DECIMALS: 8,
      EXPLORER: new Url("https://sepolia.basescan.org"),
      TOKEN_LOGO: "https://garden-finance.imgix.net/token-images/cbBTC.svg",
      CHAIN_LOGO:
        "https://garden-finance.imgix.net/chain_images/base-white.svg",
    },
    //base
    8453: {
      DISTRIBUTER_CONTRACT: "0xF568aa66C9eD68838CEBB93124EFdC4a4095dc66",
      REWARD_TOKEN_ADDRESS: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      REWARD_TOKEN_DECIMALS: 8,
      EXPLORER: new Url("https://basescan.org"),
      TOKEN_LOGO: "https://garden-finance.imgix.net/token-images/cbBTC.svg",
      CHAIN_LOGO:
        "https://garden-finance.imgix.net/chain_images/base-white.svg",
    },
  },
  SEED: {
    //arbitrum sepolia
    421614: {
      REWARD_TOKEN_ADDRESS: "0x86f65121804D2Cdbef79F9f072D4e0c2eEbABC08",
      EXPLORER: new Url("https://sepolia.arbiscan.io"),
      TOKEN_LOGO: "https://garden-finance.imgix.net/token-images/seed.svg",
      CHAIN_LOGO: "https://garden-finance.imgix.net/chain_images/sepolia.svg",
    },
    //arbitrum
    42161: {
      REWARD_TOKEN_ADDRESS: "0x86f65121804D2Cdbef79F9f072D4e0c2eEbABC08",
      EXPLORER: new Url("https://arbiscan.io"),
      TOKEN_LOGO: "https://garden-finance.imgix.net/token-images/seed.svg",
      CHAIN_LOGO: "https://garden-finance.imgix.net/chain_images/arbitrum.svg",
    },
  },
} as const;

export const STAKE_REWARD = {
  SEED: REWARD_CONFIG.SEED[STAKING_CHAIN],
  CBBTC: REWARD_CONFIG.CBBTC[REWARD_CHAIN],
};

export const GardenPassVotes = 70;
