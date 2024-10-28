import { Chain } from "@gardenfi/orderbook";
import axios from "axios";
import { create } from "zustand";
import { API } from "../constants/api";

type BlockNumberStore = {
  blockNumbers: Record<Chain, number> | null;
  isLoading: boolean;
  error: string;
  fetchAndSetBlockNumbers: () => Promise<void>;
};

const blockNumberStore = create<BlockNumberStore>()((set) => ({
  blockNumbers: null,
  isLoading: false,
  error: "",
  fetchAndSetBlockNumbers: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.get<{
        [key in Chain]: number;
      }>(API().data.blockNumbers("testnet"));
      set({ blockNumbers: res.data, error: "" });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default blockNumberStore;
