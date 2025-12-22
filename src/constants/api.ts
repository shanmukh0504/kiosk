import { Network, Url } from "@gardenfi/utils";

const REQUIRED_ENV_VARS = {
  STAKING_URL: import.meta.env.VITE_STAKING_URL,
  INFO_URL: import.meta.env.VITE_INFO_URL,
  QUOTE_URL: import.meta.env.VITE_QUOTE_URL,
  BASE_URL: import.meta.env.VITE_BASE_URL,
  REWARD: import.meta.env.VITE_REWARD_URL,
  EXPLORER: import.meta.env.VITE_EXPLORER_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
} as const;

export const API = () => {
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
    if (!value) throw new Error(`Missing ${key} in env`);
  });

  return {
    api_key: REQUIRED_ENV_VARS.API_KEY,
    home: new Url("https://garden.finance"),
    data: {
      chains: () => new Url(REQUIRED_ENV_VARS.BASE_URL).endpoint("/v2/chains"),
      blockNumbers: (network: "mainnet" | "testnet" | "localnet") =>
        new Url(REQUIRED_ENV_VARS.INFO_URL)
          .endpoint("blocknumbers")
          .endpoint(network),
      notification: () =>
        new Url(REQUIRED_ENV_VARS.INFO_URL).endpoint("notification"),
    },
    buildId: "/build-id.json",
    baseUrl: new Url(REQUIRED_ENV_VARS.BASE_URL),
    quote: {
      quote: new Url(REQUIRED_ENV_VARS.QUOTE_URL),
      fiatValues: new Url(REQUIRED_ENV_VARS.QUOTE_URL).endpoint("/fiat"),
    },
    stake: {
      stakePosition: (userId: string) =>
        new Url("stake", REQUIRED_ENV_VARS.STAKING_URL)
          .endpoint("stakes")
          .addSearchParams({
            userId: userId.toLowerCase(),
          }),
      globalApy: new Url(REQUIRED_ENV_VARS.STAKING_URL).endpoint("apy"),
      stakeApy: (address: string) =>
        new Url(REQUIRED_ENV_VARS.STAKING_URL)
          .endpoint("apy")
          .endpoint(address.toLowerCase()),
      stakingStats: new Url(REQUIRED_ENV_VARS.STAKING_URL)
        .endpoint("stake")
        .endpoint("staking-stats"),
      accumulatedReward: (userId: string) =>
        new Url(REQUIRED_ENV_VARS.STAKING_URL)
          .endpoint("rewards")
          .endpoint("accumulated")
          .endpoint(userId),
      reward: (userId: string) =>
        new Url(REQUIRED_ENV_VARS.STAKING_URL)
          .endpoint("rewards")
          .endpoint(userId),
      epoch: new Url(REQUIRED_ENV_VARS.STAKING_URL)
        .endpoint("rewards")
        .endpoint("epochs"),
    },
    explorer: (orderId: string) =>
      new Url("order", REQUIRED_ENV_VARS.EXPLORER).endpoint(orderId),
    mempoolTxExplorer: (network: Network, txHash: string) =>
      new Url(
        network === Network.MAINNET
          ? "https://mempool.space"
          : "https://mempool.space/testnet4"
      )
        .endpoint("tx")
        .endpoint(txHash),
  };
};
