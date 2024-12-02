export const btcSupportedWallets = ["com.okex.wallet", ""];

export const bitcoinWallets = {
  "com.okex.wallet": "OKX_WALLET",
};

export const ecosystems = {
  bitcoin: {
    name: "Bitcoin",
    icon: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  },
  evm: {
    name: "EVM",
    icon: "https://garden-finance.imgix.net/token-images/ethereum.svg",
  },
} as const;

export type EcosystemKeys = keyof typeof ecosystems;
