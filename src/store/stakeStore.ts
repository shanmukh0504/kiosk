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

export enum StakeType {
  GARDEN_PASS = "garden-pass",
  CUSTOM = "custom",
}

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
  globalApy: string;
  averageLockTime: string;
  totalVotes: number;
  seedLockedPercentage: string;
};

type EpochResponse = {
  epoch: string;
  reward_token: string;
  total_rewards_usd: string;
  total_rewards_tokens: string;
  fees_collected_usd: string;
  total_active_votes: number;
  remaining_pool_usd: string;
  eth_block_number: number;
};

type EpochEarnings = {
  epoch: string;
  rewards_value_usd: string;
  rewards_value_cbbtc: string;
};

type StakeStoreState = {
  asset: Asset;
  amount: number;
  error: string | null;
  totalStakedAmount: number;
  totalVotes: number;
  totalGardenerPasses: number;
  stakePosData: StakingPosition[] | null;
  stakeApys: Record<string, number>;
  stakingStats: StakingStats | null;
  stakeType: StakeType;
  epochData: EpochResponse[] | null;
  epochEarnings: EpochEarnings[] | null;
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
  setAmount: (value: number) => void;
  setStakeType: (type: StakeType) => void;
  fetchStakePosData: (address: string) => Promise<void>;
  fetchAndSetStakingStats: () => Promise<void>;
  fetchAndSetStakeApy: (address: string) => Promise<void>;
  fetchAndSetRewards: (address: string) => Promise<void>;
  fetchAndSetEpoch: () => Promise<void>;
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
  epochs: {
    epoch: string;
    rewards_value_cbbtc: number;
    rewards_value_usd: string;
    active_votes: string;
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
  multiplier: number;
  lastStakedAtBlock: number;
  isPerma: boolean;
  isGardenerPass: boolean;
};

type StakingPositionApiResponse = {
  data: {
    [address: string]: StakingPosition[];
  };
};

export const stakeStore = create<StakeStoreState>((set) => ({
  asset: SEED,
  amount: 0,
  error: null,
  stakePosData: null,
  totalStakedAmount: 0,
  totalVotes: 0,
  totalGardenerPasses: 0,
  stakingStats: null,
  stakeApys: {},
  stakeRewards: null,
  stakeType: StakeType.CUSTOM,
  epochData: null,
  epochEarnings: null,
  loading: {
    stakeRewards: false,
  },
  setAmount: (value: number) => set({ amount: value }),
  setStakeType: (type: StakeType) => set({ stakeType: type }),
  fetchStakePosData: async (address: string) => {
    try {
      const response = await axios.get<StakingPositionApiResponse>(
        API().stake.stakePosition(address.toLowerCase()).toString()
      );
      if (response.status === 200 && response.data) {
        const stakes = response.data.data[address.toLowerCase()] ?? [];
        const stats = stakes.reduce(
          (acc, stake) => {
            if (
              stake.status !== StakePositionStatus.expired &&
              stake.status !== StakePositionStatus.unStaked
            ) {
              acc.totalVotes += stake.votes;
              if (stake.isGardenerPass) {
                acc.totalGardenerPasses += 1;
              }
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
            totalGardenerPasses: 0,
          }
        );

        set({
          stakePosData: stakes,
          totalVotes: stats.totalVotes,
          totalStakedAmount: stats.totalStakedAmount,
          totalGardenerPasses: stats.totalGardenerPasses,
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
          globalApy: number;
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
          globalApy: Number(response.data.data.globalApy).toFixed(2),
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
          stakeApys: {
            [stakeId: string]: number;
          };
          userApy: number;
        };
      }>(API().stake.stakeApy(address.toLowerCase()).toString());
      set({ stakeApys: response.data.data.stakeApys });
    } catch (error) {
      console.error(error);
    }
  },
  fetchAndSetRewards: async (address: string) => {
    try {
      set({ loading: { stakeRewards: true } });
      const resp = await axios.get<{
        data: StakingReward;
      }>(API().stake.reward(address).toString());

      const epochResp = resp.data.data.epochs;
      const epochEarnings = epochResp.map((epoch) => ({
        epoch: epoch.epoch,
        rewards_value_usd: epoch.rewards_value_usd,
        rewards_value_cbbtc: epoch.rewards_value_cbbtc.toString(),
      }));
      set({ epochEarnings });
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
          rewardResponse: resp.data.data,
          stakewiseRewards,
          totalcbBtcReward: resp.data.data.cumulative_rewards_cbbtc,
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
  fetchAndSetEpoch: async () => {
    try {
      const response = await axios.get<{ data: EpochResponse[] }>(
        API().stake.epoch.toString()
      );
      console.log("epochData", response.data.data);
      set({ epochData: response.data.data });
    } catch (error) {
      console.error("Error fetching current epoch :", error);
    }
  },
  clearStakePosData: () => set({ stakePosData: null }),
}));
