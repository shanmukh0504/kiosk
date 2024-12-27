export const evmToBTCid: Record<string, string> = {
  "com.okex.wallet": "okx",
} as const;

export const btcToEVMid: Record<string, string> = {
  okx: "com.okex.wallet",
} as const;

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
