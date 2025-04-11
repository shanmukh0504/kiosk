import { Network } from "@gardenfi/utils";
import { network } from "../../../constants/constants";

export const evmToBTCid: Record<string, string> = {
  "com.okex.wallet": "okx",
} as const;

export const btcToEVMid: Record<string, string> = {
  okx: "com.okex.wallet",
} as const;

export const MAX_VISIBLE_WALLETS = 3;

export const ecosystems = {
  bitcoin: {
    name: "Bitcoin",
    icon: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  },
  evm: {
    name: "EVM",
    icon: "https://garden-finance.imgix.net/token-images/ethereum.svg",
  },
  starknet: {
    name: "Starknet",
    icon: "https://garden-finance.imgix.net/starknet-logo.svg",
  },
} as const;

export type EcosystemKeys = keyof typeof ecosystems;

type GardenSupportedWalletsType = {
  id: string;
  name: string;
  logo: string;
  installLink: string;
  isBitcoinSupported: boolean;
  isEVMSupported: boolean;
  isStarknetSupported: boolean;
};

export const GardenSupportedWallets: Record<
  string,
  GardenSupportedWalletsType
> = {
  injected: {
    id: "injected",
    name: "Injected",
    logo: "https://garden-finance.imgix.net/wallets/injected.svg",
    installLink: "https://metamask.io/download/",
    isBitcoinSupported: false,
    isEVMSupported: true,
    isStarknetSupported: false,
  },
  metaMaskSDK: {
    id: "metaMaskSDK",
    name: "Metamask",
    logo: "https://garden-finance.imgix.net/wallets/metamask.svg",
    installLink: "https://metamask.io/download/",
    isBitcoinSupported: false,
    isEVMSupported: true,
    isStarknetSupported: false,
  },
  "com.brave.wallet": {
    id: "com.brave.wallet",
    name: "Brave Wallet",
    logo: "https://garden-finance.imgix.net/wallets/brave.svg",
    installLink: "https://brave.com/en-in/wallet/",
    isBitcoinSupported: false,
    isEVMSupported: true,
    isStarknetSupported: false,
  },
  "app.phantom": {
    id: "app.phantom",
    name: "Phantom",
    logo: "https://garden-finance.imgix.net/wallets/phantom.svg",
    installLink:
      "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
    isBitcoinSupported: false,
    isEVMSupported: network === Network.MAINNET,
    isStarknetSupported: false,
  },
  "com.coinbase.wallet": {
    id: "com.coinbase.wallet",
    name: "Coinbase Wallet",
    logo: "https://garden-finance.imgix.net/wallets/coinbase.svg",
    installLink: "https://www.coinbase.com/wallet/downloads",
    isBitcoinSupported: false,
    isEVMSupported: true,
    isStarknetSupported: false,
  },
  "com.okex.wallet": {
    id: "com.okex.wallet",
    name: "OKX Wallet",
    logo: "https://garden-finance.imgix.net/wallets/okx.svg",
    installLink: "https://www.okx.com/download",
    isBitcoinSupported: network === Network.MAINNET ? true : false,
    isEVMSupported: true,
    isStarknetSupported: false,
  },
  unisat: {
    id: "unisat",
    name: "Unisat",
    logo: "https://garden-finance.imgix.net/wallets/unisat.svg",
    installLink: "https://unisat.io/",
    isBitcoinSupported: true,
    isEVMSupported: false,
    isStarknetSupported: false,
  },
  "io.rabby": {
    id: "io.rabby",
    name: "Rabby Wallet",
    logo: "https://garden-finance.imgix.net/wallets/rabby.svg",
    installLink: "https://rabby.io/",
    isBitcoinSupported: false,
    isEVMSupported: true,
    isStarknetSupported: false,
  },
  braavos: {
    id: "braavos",
    name: "Braavos",
    logo: "https://garden-finance.imgix.net/wallet/braavos.svg",
    installLink: "tallLink:",
    isStarknetSupported: true,
    isBitcoinSupported: false,
    isEVMSupported: false,
  },
  argentX: {
    id: "argentX",
    name: "Argent X",
    logo: "https://garden-finance.imgix.net/wallet/argent.svg",
    installLink: "tallLink:",
    isStarknetSupported: true,
    isBitcoinSupported: false,
    isEVMSupported: false,
  },
};
