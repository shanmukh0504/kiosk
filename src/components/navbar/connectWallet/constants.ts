import { Network } from "@gardenfi/utils";
import { network } from "../../../constants/constants";
import { BlockchainType } from "@gardenfi/orderbook";

export const ecosystems = {
  [BlockchainType.Bitcoin]: {
    name: "Bitcoin",
    icon: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  },
  [BlockchainType.EVM]: {
    name: "EVM",
    icon: "https://garden-finance.imgix.net/token-images/ethereum.svg",
  },
  [BlockchainType.Starknet]: {
    name: "Starknet",
    icon: "https://garden-finance.imgix.net/starknet-logo.svg",
  },
  [BlockchainType.Solana]: {
    name: "Solana",
    icon: "https://garden-finance.imgix.net/chain_images/solana.png",
  },
} as const;

export type EcosystemKeys = keyof typeof ecosystems;

export const evmToBTCid: Record<string, string> = {
  "com.okex.wallet": "okx",
  "app.phantom": "phantom",
} as const;

export const btcToEVMid: Record<string, string> = {
  okx: "com.okex.wallet",
  phantom: "app.phantom",
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
  [BlockchainType.Bitcoin]?: boolean;
  [BlockchainType.EVM]?: boolean;
  [BlockchainType.Starknet]?: boolean;
  [BlockchainType.Solana]?: boolean;
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
  isBitcoinSupported: capabilities[BlockchainType.Bitcoin] ?? false,
  isEVMSupported: capabilities[BlockchainType.EVM] ?? false,
  isStarknetSupported: capabilities[BlockchainType.Starknet] ?? false,
  isSolanaSupported: capabilities[BlockchainType.Solana] ?? false,
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
    { EVM: true }
  ),
  metaMaskSDK: createWallet(
    "metaMaskSDK",
    "Metamask",
    "wallets/metamask.svg",
    "https://metamask.io/download/",
    { EVM: true, Solana: true }
  ),
  "com.brave.wallet": createWallet(
    "com.brave.wallet",
    "Brave Wallet",
    "wallets/brave.svg",
    "https://brave.com/en-in/wallet/",
    { EVM: true }
  ),
  "app.phantom": createWallet(
    "app.phantom",
    "Phantom",
    "wallets/phantomDark.svg",
    "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
    {
      EVM: network === Network.MAINNET,
      Bitcoin: true,
      Solana: true,
    }
  ),
  "com.coinbase.wallet": createWallet(
    "com.coinbase.wallet",
    "Coinbase Wallet",
    "wallets/coinbase.svg",
    "https://www.coinbase.com/wallet/downloads",
    { EVM: true }
  ),
  "com.okex.wallet": createWallet(
    "com.okex.wallet",
    "OKX Wallet",
    "wallets/okx.svg",
    "https://www.okx.com/download",
    {
      Bitcoin: network === Network.MAINNET,
      EVM: true,
    }
  ),
  unisat: createWallet(
    "unisat",
    "Unisat",
    "wallets/unisat.svg",
    "https://unisat.io/",
    { Bitcoin: true }
  ),
  "io.rabby": createWallet(
    "io.rabby",
    "Rabby Wallet",
    "wallets/rabby.svg",
    "https://rabby.io/",
    { EVM: true }
  ),
  braavos: createWallet(
    "braavos",
    "Braavos",
    "wallet/braavos.svg",
    "https://braavos.app/",
    { Starknet: true }
  ),
  argentX: createWallet(
    "argentX",
    "Ready Wallet (formerly Argent)",
    "wallet/argent.svg",
    "https://www.argent.xyz/argent-x",
    { Starknet: true }
  ),
  keplr: createWallet("keplr", "Keplr", "wallets/keplr.svg", "tallLink:", {
    EVM: true,
    Starknet: true,
    Bitcoin: network === Network.MAINNET,
  }),
  leap: createWallet("leap", "Leap Wallet", "wallets/leap.svg", "https://www.leapwallet.io/", {
    EVM: true,
  }),
  xverse: createWallet(
    "xverse",
    "Xverse",
    "wallets/xverse.svg",
    "https://www.xverse.app/download",
    { Bitcoin: true }
  ),
  solflare: createWallet(
    "solflare",
    "Solflare",
    "wallets/Solflare.svg",
    "https://www.solflare.com/",
    { Solana: true }
  ),
  backpack: createWallet(
    "backpack",
    "Backpack",
    "wallets/Backpack.svg",
    "https://backpack.app/",
    { Solana: true }
  ),
};
