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
    leaderboard: { quests: REQUIRED_ENV_VARS.QUESTS_URL + "/quests" },
    buildId: "/build-id.json",
    orderbook: new Url(REQUIRED_ENV_VARS.ORDERBOOK_URL),
    quote: new Url(REQUIRED_ENV_VARS.QUOTE_URL),
    stake: {
      stakePosition: (userId: string) =>
        new Url("stakes", REQUIRED_ENV_VARS.STAKING_URL).addSearchParams({
          userId: userId.toLowerCase(),
        }),
      globalApy: new Url(REQUIRED_ENV_VARS.STAKING_URL).endpoint("apy"),
      stakeApy: (address: string) =>
        new Url(REQUIRED_ENV_VARS.STAKING_URL)
          .endpoint("apy")
          .endpoint(address.toLowerCase()),
      stakingStats: new Url(REQUIRED_ENV_VARS.STAKING_URL).endpoint(
        "stakingStats"
      ),
      accumulatedReward: (userId: string) =>
        new Url(REQUIRED_ENV_VARS.STAKING_URL)
          .endpoint("rewards")
          .endpoint(userId),
    },
    reward: (userId: string) =>
      new Url(REQUIRED_ENV_VARS.REWARD).endpoint("rewards").endpoint(userId),
    explorer: (orderId: string) =>
      new Url("order", REQUIRED_ENV_VARS.EXPLORER).endpoint(orderId),
    whitelist: (address: string) =>
      new Url("whitelist", REQUIRED_ENV_VARS.WHITELIST).endpoint(address),
  };
};
