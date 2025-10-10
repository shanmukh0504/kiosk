import { Url } from "@gardenfi/utils";

const REQUIRED_ENV_VARS = {
  STAKING_URL: import.meta.env.VITE_STAKING_URL,
  INFO_URL: import.meta.env.VITE_INFO_URL,
  QUOTE_URL: import.meta.env.VITE_QUOTE_URL,
  BASE_URL: import.meta.env.VITE_BASE_URL,
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
      info: new Url(REQUIRED_ENV_VARS.INFO_URL),
      chains: () => new Url(REQUIRED_ENV_VARS.BASE_URL).endpoint("/v2/chains"),
      blockNumbers: (network: "mainnet" | "testnet" | "localnet") =>
        new Url(REQUIRED_ENV_VARS.INFO_URL)
          .endpoint("blocknumbers")
          .endpoint(network),
      notification: () =>
        new Url(REQUIRED_ENV_VARS.INFO_URL).endpoint("notification"),
    },
    buildId: "/build-id.json",
    orderbook: new Url(REQUIRED_ENV_VARS.BASE_URL),
    quote: {
      quote: new Url(REQUIRED_ENV_VARS.BASE_URL),
      fiatValues: new Url(REQUIRED_ENV_VARS.QUOTE_URL).endpoint("/fiat"),
    },
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
  };
};
