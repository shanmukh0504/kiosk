import { create } from "zustand";
import { API } from "../constants/api";
import axios from "axios";
import { Partner } from "../constants/quests";

type OneTimeBonus = {
  user_address: string;
  amount: string;
  partner: Partner;
};

type QuestData = {
  oneTimeBonus: OneTimeBonus[];
  // These fields are unused so we they are yet to be defined
  raffleEntries: null;
  raffleWinners: null;
};

type QuestState = {
  questData: QuestData | null;
  isLoading: boolean;
  error: string | null;
  fetchQuestData: () => Promise<void>;
};

export const questStore = create<QuestState>((set) => ({
  questData: null,
  isLoading: false,
  error: null,

  fetchQuestData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get<QuestData>(API().leaderboard.quests.toString());

      if (response.status === 200) {
        set({ questData: response.data });
      } else {
        set({ error: "Failed to fetch quest data" });
      }
    } catch (error) {
      console.error(error);
      set({ error: "An error occurred while fetching quest data" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
