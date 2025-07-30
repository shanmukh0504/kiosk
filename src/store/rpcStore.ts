import { create } from "zustand";
import { SupportedChains } from "../layout/wagmi/config";
import { getAllRPCs, getWorkingRPCs } from "../utils/rpcUtils";

type rpcStoreState = {
  allRPCs: Record<number, string[]>;
  workingRPCs: Record<number, string[]>;
  isLoading: boolean;
  fetchAndSetRPCs: () => Promise<void>;
  getWorkingRPCsForChain: (chainId: number) => Promise<string[]>;
};

export const rpcStore = create<rpcStoreState>((set, get) => ({
  allRPCs: {},
  workingRPCs: {},
  isLoading: false,
  fetchAndSetRPCs: async () => {
    set({ isLoading: true });
    const allRPCs = await getAllRPCs([...SupportedChains]); 
    set({ allRPCs, isLoading: false });
  },
  getWorkingRPCsForChain: async (chainId: number) => {
    const { allRPCs, workingRPCs } = get();
    if (workingRPCs[chainId] && workingRPCs[chainId].length > 0) {
      return workingRPCs[chainId];
    }
    
    const chainRPCs = allRPCs[chainId];
    const workingChainRPCs = await getWorkingRPCs(chainRPCs);
    
    set({ 
      workingRPCs: { 
        ...workingRPCs, 
        [chainId]: workingChainRPCs 
      } 
    });
    
    return workingChainRPCs;
  },
}));
