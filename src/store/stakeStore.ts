import { create } from "zustand";
import { Asset } from "@gardenfi/orderbook";
import { DURATION } from "../constants/stake";
import { API } from "../constants/api";
import axios from "axios";

const SEED: Asset = {
  name: "Seed",
  decimals: 18,
  symbol: "SEED",
  logo: "https://garden-finance.imgix.net/token-images/seed.svg",
  tokenAddress: "0x13DCec0762EcC5E666c207ab44Dc768e5e33070F",
  atomicSwapAddress: "0xD5FeDb4ceCB0F1D32788a190d9EB47D94D23eE4e",
  chain: "arbitrum_sepolia",
};

interface StakeStoreState {
  asset: Asset;
  inputAmount: string;
  selectedDuration: DURATION;
  isStake: boolean;
  isExtend: boolean;
  isLoading: boolean;
  error: string | null;
  totalStakedAmount: number;
  totalVotes: number;
  stakePosData: StakingPositionApiResponse | null;
  stakeToExtend: StakingPosition | null;
  setInputAmount: (value: string) => void;
  setSelectedDuration: (duration: DURATION) => void;
  fetchStakePosData: (address?: string) => Promise<void>;
  setIsStake: (value: boolean) => void;
  setIsExtend: (value: boolean) => void;
  setStakeToExtend: (value: StakingPosition) => void;
  setTotalStakedAmount: (value: number) => void;
  setTotalVotes: (value: number) => void;
}

export enum StakePositionStatus {
  staked = "staked",
  expired = "expired",
  unstaked = "unstaked",
}

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
  selectedDuration: 6,
  isStake: false,
  isExtend: false,
  isLoading: false,
  error: null,
  stakePosData: null,
  stakeToExtend: null,
  totalStakedAmount: 0,
  totalVotes: 0,
  setInputAmount: (value: string) => set({ inputAmount: value }),
  setSelectedDuration: (duration: DURATION) =>
    set({ selectedDuration: duration }),
  fetchStakePosData: async (address?: string) => {
    try {
      const response = await axios.get<StakingPositionApiResponse>(
        API().stakePosition(
          address ? address : "0xeb7e1c4b16203187d2f46071203494662b4ee5c6"
        )
      );
      console.log(response);
      if (response.status === 200 && response.data) {
        set({ stakePosData: response.data });
      } else {
        set({ error: "Unexpected response format from server" });
      }
    } catch (error) {
      console.error(error);
      set({ error: "An error occurred while fetching staking position data" });
    } finally {
      set({ isLoading: false });
    }
  },
  setIsStake: (value) => set({ isStake: value }),
  setIsExtend: (value) => set({ isExtend: value }),
  setStakeToExtend: (value) => set({ stakeToExtend: value }),
  setTotalStakedAmount: (value) => set({ totalStakedAmount: value }),
  setTotalVotes: (value) => set({ totalVotes: value }),
}));
