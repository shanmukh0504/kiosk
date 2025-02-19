import { Url } from "@gardenfi/utils";

const REQUIRED_ENV_VARS = {
  DATA_URL: import.meta.env.VITE_DATA_URL,
  QUESTS_URL: import.meta.env.VITE_QUESTS_URL,
  ORDERBOOK_URL: import.meta.env.VITE_ORDERBOOK_URL,
  QUOTE_URL: import.meta.env.VITE_QUOTE_URL,
  WHITELIST: import.meta.env.VITE_WHITELIST_URL,
  EXPLORER: import.meta.env.VITE_EXPLORER_URL,
} as const;

export const API = () => {
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
    if (!value) throw new Error(`Missing ${key} in env`);
  });

  return {
    home: "https://garden.finance",
    data: {
      data: REQUIRED_ENV_VARS.DATA_URL,
      assets: REQUIRED_ENV_VARS.DATA_URL + "/assets",
      blockNumbers: (network: "mainnet" | "testnet") =>
        REQUIRED_ENV_VARS.DATA_URL + "/blocknumber/" + network,
    },
    leaderboard: { quests: REQUIRED_ENV_VARS.QUESTS_URL + "/quests" },
    buildId: "/build-id.json",
    orderbook: REQUIRED_ENV_VARS.ORDERBOOK_URL,
    quote: REQUIRED_ENV_VARS.QUOTE_URL,
    addressExplorer: (network: "mainnet" | "testnet") =>
      new Url(
        "address",
        network === "testnet"
          ? "https://mempool.space/testnet4/api"
          : "https://mempool.space/api"
      ),
    explorer: (orderId: string) =>
      REQUIRED_ENV_VARS.EXPLORER + `order/${orderId}`,
    whitelist: (address: string) =>
      REQUIRED_ENV_VARS.WHITELIST + `whitelist/${address}`,
  };
};
