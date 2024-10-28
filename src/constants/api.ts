const REQUIRED_ENV_VARS = {
  DATA_URL: import.meta.env.VITE_DATA_URL,
  QUESTS_URL: import.meta.env.VITE_QUESTS_URL,
  ORDERBOOK_URL: import.meta.env.VITE_ORDERBOOK_URL,
  QUOTE_URL: import.meta.env.VITE_QUOTE_URL,
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
    leaderboard: REQUIRED_ENV_VARS.QUESTS_URL,
    buildId: "/build-id.json",
    orderbook: REQUIRED_ENV_VARS.ORDERBOOK_URL,
    quests: REQUIRED_ENV_VARS.QUESTS_URL + "/quests",
    quote: REQUIRED_ENV_VARS.QUOTE_URL,
    mempool: {
      testnet: "https://mempool.space/testnet4/api",
      mainnet: "https://mempool.space",
    },
  };
};