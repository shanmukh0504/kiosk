const protocol = "https://";
const DATA_URL = import.meta.env.VITE_DATA_URL as string;
const QUESTS_URL = import.meta.env.VITE_QUESTS_URL as string;

export const API = () => {
  if (!DATA_URL) {
    throw new Error("Missing VITE_DATA_URL in env");
  }
  if (!QUESTS_URL) {
    throw new Error("Missing VITE_QUESTS_URL in env");
  }

  return {
    home: "https://garden.finance",
    assets: protocol + DATA_URL + "/assets",
    quests: protocol + QUESTS_URL + "/quests",
    buildId: "/build-id.json",
  };
};
