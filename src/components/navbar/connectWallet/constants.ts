import { Network } from "@gardenfi/utils";
import { network } from "../../../constants/constants";

// Ecosystem enum
export enum Ecosystem {
  BITCOIN = "bitcoin",
  EVM = "evm",
  STARKNET = "starknet",
  SOLANA = "solana",
}

// Ecosystem configuration
export const ecosystems = {
  [Ecosystem.BITCOIN]: {
    name: "Bitcoin",
    icon: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  },
  [Ecosystem.EVM]: {
    name: "EVM",
    icon: "https://garden-finance.imgix.net/token-images/ethereum.svg",
  },
  [Ecosystem.STARKNET]: {
    name: "Starknet",
    icon: "https://garden-finance.imgix.net/starknet-logo.svg",
  },
  [Ecosystem.SOLANA]: {
    name: "Solana",
    icon: "https://garden-finance.imgix.net/chain_images/solana.png",
  },
} as const;

export type EcosystemKeys = keyof typeof ecosystems;

export const evmToBTCid: Record<string, string> = {
  "com.okex.wallet": "okx",
} as const;

export const btcToEVMid: Record<string, string> = {
  okx: "com.okex.wallet",
} as const;

export const MAX_VISIBLE_WALLETS = 3;

// Base wallet interface
interface BaseWallet {
  id: string;
  name: string;
  logo: string;
  installLink: string;
  isBitcoinSupported: boolean;
  isEVMSupported: boolean;
  isStarknetSupported: boolean;
  isSolanaSupported: boolean;
}

// Wallet capabilities interface
interface WalletCapabilities {
  [Ecosystem.BITCOIN]?: boolean;
  [Ecosystem.EVM]?: boolean;
  [Ecosystem.STARKNET]?: boolean;
  [Ecosystem.SOLANA]?: boolean;
}

type GardenSupportedWalletsType = BaseWallet & WalletCapabilities;

const createWallet = (
  id: string,
  name: string,
  logoPath: string,
  installLink: string,
  capabilities: WalletCapabilities
): GardenSupportedWalletsType => ({
  id,
  name,
  logo: `https://garden-finance.imgix.net/${logoPath}`,
  installLink,
  isBitcoinSupported: capabilities[Ecosystem.BITCOIN] ?? false,
  isEVMSupported: capabilities[Ecosystem.EVM] ?? false,
  isStarknetSupported: capabilities[Ecosystem.STARKNET] ?? false,
  isSolanaSupported: capabilities[Ecosystem.SOLANA] ?? false,
});

export const GardenSupportedWallets: Record<
  string,
  GardenSupportedWalletsType
> = {
  injected: createWallet(
    "injected",
    "Injected",
    "wallets/injected.svg",
    "https://metamask.io/download/",
    { evm: true }
  ),
  metaMaskSDK: createWallet(
    "metaMaskSDK",
    "Metamask",
    "wallets/metamask.svg",
    "https://metamask.io/download/",
    { evm: true, solana: true }
  ),
  "com.brave.wallet": createWallet(
    "com.brave.wallet",
    "Brave Wallet",
    "wallets/brave.svg",
    "https://brave.com/en-in/wallet/",
    { evm: true }
  ),
  "app.phantom": createWallet(
    "app.phantom",
    "Phantom",
    "wallets/phantom.svg",
    "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
    {
      evm: network === Network.MAINNET,
      solana: true,
    }
  ),
  "com.coinbase.wallet": createWallet(
    "com.coinbase.wallet",
    "Coinbase Wallet",
    "wallets/coinbase.svg",
    "https://www.coinbase.com/wallet/downloads",
    { evm: true }
  ),
  "com.okex.wallet": createWallet(
    "com.okex.wallet",
    "OKX Wallet",
    "wallets/okx.svg",
    "https://www.okx.com/download",
    {
      bitcoin: network === Network.MAINNET,
      evm: true,
    }
  ),
  unisat: createWallet(
    "unisat",
    "Unisat",
    "wallets/unisat.svg",
    "https://unisat.io/",
    { bitcoin: true }
  ),
  "io.rabby": createWallet(
    "io.rabby",
    "Rabby Wallet",
    "wallets/rabby.svg",
    "https://rabby.io/",
    { evm: true }
  ),
  braavos: createWallet(
    "braavos",
    "Braavos",
    "wallet/braavos.svg",
    "https://braavos.app/",
    { starknet: true }
  ),
  argentX: createWallet(
    "argentX",
    "Argent X",
    "wallet/argent.svg",
    "https://www.argent.xyz/argent-x",
    { starknet: true }
  ),
  keplr: createWallet("keplr", "Keplr", "wallets/keplr.svg", "tallLink:", {
    starknet: true,
  }),
  solflare: createWallet(
    "solflare",
    "Solflare",
    "wallets/Solflare.svg",
    "https://www.solflare.com/",
    { solana: true }
  ),
  backpack: createWallet(
    "backpack",
    "Backpack",
    "wallets/Backpack.svg",
    "https://backpack.app/",
    { solana: true }
  ),
};
