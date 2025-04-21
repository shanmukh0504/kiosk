import { Chain } from "@gardenfi/orderbook";
import axios from "axios";
import { create } from "zustand";
import { API } from "../constants/api";
import { network } from "../constants/constants";
import { Network } from "@gardenfi/utils";

type BlockNumberStore = {
  blockNumbers: Record<Chain, number> | null;
  isLoading: boolean;
  error: string;
  fetchAndSetBlockNumbers: () => Promise<Record<Chain, number> | null>;
};

export const blockNumberStore = create<BlockNumberStore>()((set, get) => ({
  blockNumbers: null,
  isLoading: false,
  error: "",
  fetchAndSetBlockNumbers: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.get<{
        [key in Chain]: number;
      }>(
        API()
          .data.blockNumbers(network as Network)
          .toString()
      );
      set({ blockNumbers: res.data, error: "" });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
    return get().blockNumbers;
  },
}));
