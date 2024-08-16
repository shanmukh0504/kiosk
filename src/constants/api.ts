const protocol = "https://";
const QUESTS_URL = import.meta.env.VITE_QUESTS_URL as string;

export const API = () => {
  if (!QUESTS_URL) {
    throw new Error("Missing VITE_QUESTS_URL in env");
  }

  return { quests: protocol + QUESTS_URL + "/quests" };
};
