import { Network } from "@gardenfi/utils";
import { network } from "../../../constants/constants";
enum BlockchainType {
  bitcoin = "bitcoin",
  evm = "evm",
  solana = "solana",
  starknet = "starknet",
  sui = "sui",
  tron = "tron",
}

export const ecosystems = {
  [BlockchainType.bitcoin]: {
    name: "Bitcoin",
    icon: "https://garden.imgix.net/token-images/bitcoin.svg",
  },
  [BlockchainType.evm]: {
    name: "EVM",
    icon: "https://garden.imgix.net/token-images/ethereum.svg",
  },
  [BlockchainType.starknet]: {
    name: "Starknet",
    icon: "https://garden.imgix.net/starknet-logo.svg",
  },
  [BlockchainType.solana]: {
    name: "Solana",
    icon: "https://garden.imgix.net/chain_images/solana.png",
  },
  [BlockchainType.sui]: {
    name: "Sui",
    icon: "https://garden.imgix.net/chain_images/sui.svg",
  },
  [BlockchainType.tron]: {
    name: "tron",
    icon: "https://garden-finance.imgix.net/chain_images/tron.svg",
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
  isSuiSupported: boolean;
  isTronSupported: boolean;
}

// Wallet capabilities interface
interface WalletCapabilities {
  [BlockchainType.bitcoin]?: boolean;
  [BlockchainType.evm]?: boolean;
  [BlockchainType.starknet]?: boolean;
  [BlockchainType.solana]?: boolean;
  [BlockchainType.sui]?: boolean;
  [BlockchainType.tron]?: boolean;
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
  logo: logoPath,
  installLink,
  isBitcoinSupported: capabilities[BlockchainType.bitcoin] ?? false,
  isEVMSupported: capabilities[BlockchainType.evm] ?? false,
  isStarknetSupported: capabilities[BlockchainType.starknet] ?? false,
  isSolanaSupported: capabilities[BlockchainType.solana] ?? false,
  isSuiSupported: capabilities[BlockchainType.sui] ?? false,
  isTronSupported: capabilities[BlockchainType.tron] ?? false,
});

export const GardenSupportedWallets: Record<
  string,
  GardenSupportedWalletsType
> = {
  injected: createWallet(
    "injected",
    "Injected",
    "https://garden-finance.imgix.net/wallets/injected.svg",
    "https://metamask.io/download/",
    { evm: true }
  ),
  metaMaskSDK: createWallet(
    "metaMaskSDK",
    "Metamask",
    "https://garden-finance.imgix.net/wallets/metamask.svg",
    "https://metamask.io/download/",
    { evm: true }
  ),
  "com.brave.wallet": createWallet(
    "com.brave.wallet",
    "Brave Wallet",
    "https://garden-finance.imgix.net/wallets/brave.svg",
    "https://brave.com/en-in/wallet/",
    { evm: true }
  ),
  "app.phantom": createWallet(
    "app.phantom",
    "Phantom",
    "https://garden-finance.imgix.net/wallets/phantomDark.svg",
    "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
    {
      evm: network === Network.MAINNET,
      bitcoin: true,
      solana: true,
      sui: true,
    }
  ),
  "com.coinbase.wallet": createWallet(
    "com.coinbase.wallet",
    "Coinbase Wallet",
    "https://garden-finance.imgix.net/wallets/coinbase.svg",
    "https://www.coinbase.com/wallet/downloads",
    { evm: true }
  ),
  "com.okex.wallet": createWallet(
    "com.okex.wallet",
    "OKX Wallet",
    "https://garden-finance.imgix.net/wallets/okx.svg",
    "https://www.okx.com/download",
    {
      bitcoin: network === Network.MAINNET,
      evm: true,
      sui: network === Network.MAINNET,
    }
  ),
  unisat: createWallet(
    "unisat",
    "Unisat",
    "https://garden-finance.imgix.net/wallets/unisat.svg",
    "https://unisat.io/",
    { bitcoin: true }
  ),
  "io.rabby": createWallet(
    "io.rabby",
    "Rabby Wallet",
    "https://garden-finance.imgix.net/wallets/rabby.svg",
    "https://rabby.io/",
    { evm: true }
  ),
  braavos: createWallet(
    "braavos",
    "Braavos",
    "https://garden-finance.imgix.net/wallets/braavos.svg",
    "https://braavos.app/",
    { starknet: true }
  ),
  argentX: createWallet(
    "argentX",
    "Ready Wallet (formerly Argent)",
    "https://garden-finance.imgix.net/wallets/argent.svg",
    "https://www.argent.xyz/argent-x",
    { starknet: true }
  ),
  keplr: createWallet(
    "keplr",
    "Keplr",
    "https://garden-finance.imgix.net/wallets/keplr.svg",
    "tallLink:",
    {
      evm: network === Network.MAINNET,
      starknet: true,
      bitcoin: network === Network.MAINNET,
    }
  ),
  leap: createWallet(
    "leap",
    "Leap Wallet",
    "https://garden-finance.imgix.net/wallets/LeapLight.svg",
    "https://www.leapwallet.io/",
    {
      evm: network === Network.MAINNET,
    }
  ),
  xverse: createWallet(
    "xverse",
    "Xverse",
    "https://garden-finance.imgix.net/wallets/xverse.svg",
    "https://www.xverse.app/download",
    { bitcoin: true }
  ),
  solflare: createWallet(
    "solflare",
    "Solflare",
    "https://garden-finance.imgix.net/wallets/Solflare.svg",
    "https://www.solflare.com/",
    { solana: true }
  ),
  "app.backpack": createWallet(
    "app.backpack",
    "Backpack",
    "https://garden-finance.imgix.net/wallets/Backpack.svg",
    "https://backpack.app/",
    {
      solana: network === Network.MAINNET,
      evm: network === Network.MAINNET,
      sui: network === Network.MAINNET,
    }
  ),
  slush: createWallet(
    "slush",
    "Slush Wallet",
    "https://garden-finance.imgix.net/wallets/SlushLogo.png",
    "https://slushwallet.com/",
    { sui: true }
  ),
  tokeo: createWallet(
    "tokeo",
    "Tokeo",
    "https://garden-finance.imgix.net/wallets/TokeoLogo.webp",
    "https://tokeo.io/",
    { sui: network === Network.MAINNET }
  ),
  tronlink: createWallet(
    "tronlink",
    "Tron Link",
    "https://garden.imgix.net/wallets/TronLinkIcon.svg",
    "https://www.tronlink.org/",
    { tron: true }
  ),
};
