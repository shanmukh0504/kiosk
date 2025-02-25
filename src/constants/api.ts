import { Url } from "@gardenfi/utils";

const REQUIRED_ENV_VARS = {
  STAKING_URL: import.meta.env.VITE_STAKING_URL,
  DATA_URL: import.meta.env.VITE_DATA_URL,
  QUESTS_URL: import.meta.env.VITE_QUESTS_URL,
  ORDERBOOK_URL: import.meta.env.VITE_ORDERBOOK_URL,
  QUOTE_URL: import.meta.env.VITE_QUOTE_URL,
  WHITELIST: import.meta.env.VITE_WHITELIST_URL,
  REWARD: import.meta.env.VITE_REWARD_URL,
  EXPLORER: import.meta.env.VITE_EXPLORER_URL,
} as const;

export const API = () => {
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
    if (!value) throw new Error(`Missing ${key} in env`);
  });

  return {
    home: new Url("https://garden.finance"),
    data: {
      data: new Url(REQUIRED_ENV_VARS.DATA_URL),
      assets: new Url("assets", REQUIRED_ENV_VARS.DATA_URL),
      blockNumbers: (network: "mainnet" | "testnet") =>
        new Url("blocknumber", REQUIRED_ENV_VARS.DATA_URL).endpoint(network),
    },
    leaderboard: { quests: new Url("quests", REQUIRED_ENV_VARS.QUESTS_URL) },
    buildId: new Url("/build-id.json"),
    orderbook: new Url(REQUIRED_ENV_VARS.ORDERBOOK_URL),
    quote: new Url(REQUIRED_ENV_VARS.QUOTE_URL),
    explorer: (orderId: string) =>
      new Url("order", REQUIRED_ENV_VARS.EXPLORER).endpoint(orderId),
    whitelist: (address: string) =>
      new Url("whitelist", REQUIRED_ENV_VARS.WHITELIST).endpoint(address),
  };
};
