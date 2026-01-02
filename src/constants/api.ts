import { Network, Url } from "@gardenfi/utils";

const REQUIRED_ENV_VARS = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  QUOTE_URL: import.meta.env.VITE_QUOTE_URL,
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
    data: (() => {
      const infoBase = () =>
        new Url(REQUIRED_ENV_VARS.BASE_URL).endpoint("info");
      return {
        chains: () =>
          new Url(REQUIRED_ENV_VARS.BASE_URL).endpoint("/v2/chains"),
        blockNumbers: (network: "mainnet" | "testnet" | "localnet") =>
          infoBase().endpoint("blocknumbers").endpoint(network),
        notification: () => infoBase().endpoint("notification"),
      };
    })(),
    buildId: "/build-id.json",
    baseUrl: new Url(REQUIRED_ENV_VARS.BASE_URL),
    quote: {
      quote: new Url(REQUIRED_ENV_VARS.BASE_URL).endpoint("quote"),
      fiatValues: new Url(REQUIRED_ENV_VARS.QUOTE_URL).endpoint("fiat"),
    },
    stake: (() => {
      const distributorBase = () =>
        new Url(REQUIRED_ENV_VARS.BASE_URL).endpoint("distributor");
      return {
        stakePosition: (userId: string) =>
          distributorBase()
            .endpoint("stake")
            .endpoint("stakes")
            .addSearchParams({
              userId: userId.toLowerCase(),
            }),
        globalApy: distributorBase().endpoint("apy"),
        stakeApy: (address: string) =>
          distributorBase().endpoint("apy").endpoint(address.toLowerCase()),
        stakingStats: distributorBase()
          .endpoint("stake")
          .endpoint("staking-stats"),
        accumulatedReward: (userId: string) =>
          distributorBase()
            .endpoint("rewards")
            .endpoint("accumulated")
            .endpoint(userId),
        reward: (userId: string) =>
          distributorBase().endpoint("rewards").endpoint(userId),
        epoch: distributorBase().endpoint("rewards").endpoint("epochs"),
      };
    })(),
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
