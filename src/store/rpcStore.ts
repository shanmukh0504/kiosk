import { create } from "zustand";
import { SupportedChains } from "../layout/wagmi/config";
import { getAllWorkingRPCs } from "../utils/rpcUtils";

type rpcStoreState = {
  workingRPCs: Record<number, string[]>;
  isLoading: boolean;
  fetchAndSetRPCs: () => Promise<void>;
};

export const rpcStore = create<rpcStoreState>((set) => ({
  workingRPCs: {},
  isLoading: false,
  fetchAndSetRPCs: async () => {
    set({ isLoading: true });
    const workingRPCs = await getAllWorkingRPCs([...SupportedChains], 5);
    set({ workingRPCs, isLoading: false });
  },
}));
