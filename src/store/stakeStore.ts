import { create } from "zustand";
import { Asset } from "@gardenfi/orderbook";
import { DURATION } from "../constants/stake";

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
  setInputAmount: (value: string) => void;
  setSelectedDuration: (duration: DURATION) => void;
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const stakeStore = create<StakeStoreState>((set) => ({
  asset: SEED,
  inputAmount: "",
  selectedDuration: 6,
  setInputAmount: (value: string) => set({ inputAmount: value }),
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),
  loading: false,
  setLoading: (isLoading: boolean) => set({ loading: isLoading }),
}));
