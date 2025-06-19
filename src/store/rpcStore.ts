import { create } from "zustand";
import { SupportedChains } from "../layout/wagmi/config";
import { getAllWorkingRPCs } from "../utils/rpcUtils";

type rpcStoreState = {
  workingRPCs: Record<number, string[]>;
  fetchAndSetRPCs: () => Promise<void>;
};

export const rpcStore = create<rpcStoreState>((set) => ({
  workingRPCs: {},
  fetchAndSetRPCs: async () => {
    const workingRPCs = await getAllWorkingRPCs([...SupportedChains], 5);
    set({ workingRPCs });
  },
}));
