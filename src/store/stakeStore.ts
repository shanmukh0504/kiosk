import { create } from "zustand";
import { Asset } from "@gardenfi/orderbook";
import { API } from "../constants/api";
import axios from "axios";
import {
  ETH_BLOCKS_PER_DAY,
  SEED_DECIMALS,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../components/stake/constants";
import { formatAmount } from "../utils/utils";
import { CIRCULATING_SEED_SUPPLY } from "../constants/stake";

const SEED: Asset = {
  name: "Seed",
  decimals: 18,
  symbol: "SEED",
  logo: "https://garden-finance.imgix.net/token-images/seed.svg",
  tokenAddress: STAKING_CONFIG[STAKING_CHAIN].SEED_ADDRESS,
  atomicSwapAddress: "",
  chain: STAKING_CONFIG[STAKING_CHAIN].CHAIN,
};

type StakingStats = {
  apy: number;
  averageLockTime: string;
  totalVotes: number;
  seedLockedPercentage: string;
};

type StakeStoreState = {
  asset: Asset;
  inputAmount: string;
  error: string | null;
  totalStakedAmount: number;
  totalVotes: number;
  stakePosData: StakingPosition[] | null;
  stakeApys: Record<string, number>;
  stakingStats: StakingStats | null;
  loading: {
    stakeRewards: boolean;
  };
  stakeRewards: {
    rewardResponse: Omit<StakingReward, "stakes">;
    stakewiseRewards: {
      [id: string]: AccumulatedReward;
    };
    totalcbBtcReward: number;
    totalSeedReward: number;
    accumulatedRewardUSD: number;
  } | null;
  setInputAmount: (value: string) => void;
  fetchStakePosData: (address: string) => Promise<void>;
  fetchAndSetStakingStats: () => Promise<void>;
  fetchAndSetStakeApy: (address: string) => Promise<void>;
  fetchAndSetRewards: (address: string) => Promise<void>;
  clearStakePosData: () => void;
};

export enum StakePositionStatus {
  staked = "staked",
  expired = "expired",
  unStaked = "unstaked",
}

export type StakingReward = {
  address: string;
  latest_claim_signature: string;
  cumulative_claims_cbbtc: number;
  cumulative_rewards_usd: string;
  cumulative_rewards_cbbtc: number;
  nonce: number;
  active_votes: number;
  stakes: {
    id: string;
    cumulative_reward_cbbtc: number;
  }[];
};

export type AccumulatedReward = {
  accumulatedSeedRewards: string;
  accumulatedSeedRewardsUSD: string;
  accumulatedCBBTCRewards: string;
  accumulatedCBBTCRewardsUSD: string;
  accumulatedRewardsUSD: string;
};

export type StakingAccumulatedRewards = {
  data: {
    stakeRewards: Record<string, AccumulatedReward>;
  };
};

export type StakingPosition = {
  id: string;
  expiry: number;
  votes: number;
  amount: string;
  status: StakePositionStatus;
  filler: string;
  stakedAt: string;
  lastStakedAtBlock: number;
  isPerma: boolean;
};

type StakingPositionApiResponse = {
  data: StakingPosition[];
};

export const stakeStore = create<StakeStoreState>((set) => ({
  asset: SEED,
  inputAmount: "",
  error: null,
  stakePosData: null,
  totalStakedAmount: 0,
  totalVotes: 0,
  stakingStats: null,
  stakeApys: {},
  stakeRewards: null,
  loading: {
    stakeRewards: false,
  },
  setInputAmount: (value: string) => set({ inputAmount: value }),
  fetchStakePosData: async (address: string) => {
    try {
      const response = await axios.get<StakingPositionApiResponse>(
        API().stake.stakePosition(address.toLowerCase()).toString()
      );      
      if (response.status === 200 && response.data) {
        const stakes = response.data.data;
        const stats = stakes.reduce(
          (acc, stake) => {
            if (
              stake.status !== StakePositionStatus.expired &&
              stake.status !== StakePositionStatus.unStaked
            ) {
              acc.totalVotes += stake.votes;
              acc.totalStakedAmount += formatAmount(
                stake.amount,
                SEED_DECIMALS
              );
              return acc;
            }

            return acc;
          },
          {
            totalVotes: 0,
            totalStakedAmount: 0,
          }
        );

        set({
          stakePosData: stakes,
          totalVotes: stats.totalVotes,
          totalStakedAmount: stats.totalStakedAmount,
        });
      }
    } catch (error) {
      console.error(error);
      set({ error: "An error occurred while fetching staking position data" });
    }
  },
  fetchAndSetStakingStats: async () => {
    try {
      const response = await axios.get<{
        data: {
          apy: number;
          ast: string;
          totalVotes: number;
          totalStaked: string;
        };
      }>(API().stake.stakingStats.toString());
      const avgLockTime = Math.floor(
        Number(response.data.data.ast) / ETH_BLOCKS_PER_DAY
      );
      const seedInDecimals = formatAmount(
        response.data.data.totalStaked,
        SEED_DECIMALS
      );
      const seedLockedPercentage = Number(
        Math.min((seedInDecimals / CIRCULATING_SEED_SUPPLY) * 100, 100).toFixed(
          2
        )
      ).toString();

      set({
        stakingStats: {
          apy: response.data.data.apy
            ? Number(response.data.data.apy.toFixed(2))
            : 0,
          averageLockTime: avgLockTime.toString(),
          totalVotes: response.data.data.totalVotes,
          seedLockedPercentage: seedLockedPercentage,
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  fetchAndSetStakeApy: async (address: string) => {
    try {
      const response = await axios.get<{
        data: {
          data: {
            stakeApys: {
              [stakeId: string]: number;
            };
            userApy: number;
          };
        };
      }>(API().stake.stakeApy(address.toLowerCase()).toString());
      set({ stakeApys: response.data.data.data.stakeApys });
    } catch (error) {
      console.error(error);
    }
  },
  fetchAndSetRewards: async (address: string) => {
    try {
      set({ loading: { stakeRewards: true } });
      const resp = await axios.get<StakingReward>(API().reward(address).toString());
      const accResp = await axios.get<StakingAccumulatedRewards>(
        API().stake.accumulatedReward(address).toString()
      );
      const stakewiseRewards: Record<string, AccumulatedReward> = {};
      if (accResp.status === 200 && accResp.data) {
        Object.entries(accResp.data.data.stakeRewards).forEach(
          ([address, reward]) => {
            stakewiseRewards[address] = {
              ...reward,
            };
          }
        );
      }

      set({
        stakeRewards: {
          rewardResponse: resp.data,
          stakewiseRewards,
          totalcbBtcReward: Object.values(stakewiseRewards).reduce(
            (total, reward) =>
              total + parseFloat(reward.accumulatedCBBTCRewards),
            0
          ),
          totalSeedReward: Object.values(stakewiseRewards).reduce(
            (total, reward) =>
              total + parseFloat(reward.accumulatedSeedRewards),
            0
          ),
          accumulatedRewardUSD: Object.values(stakewiseRewards).reduce(
            (total, reward) => total + parseFloat(reward.accumulatedRewardsUSD),
            0
          ),
        },
      });
    } catch (error) {
      console.error("Error fetching rewards :", error);
    } finally {
      set({ loading: { stakeRewards: false } });
    }
  },
  clearStakePosData: () => set({ stakePosData: null }),
}));
