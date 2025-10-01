import { Network } from "@gardenfi/utils";
import { network } from "../../../constants/constants";
import { BlockchainType } from "@gardenfi/orderbook";

export const ecosystems = {
  [BlockchainType.bitcoin]: {
    name: "bitcoin",
    icon: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  },
  [BlockchainType.evm]: {
    name: "evm",
    icon: "https://garden-finance.imgix.net/token-images/ethereum.svg",
  },
  [BlockchainType.starknet]: {
    name: "starknet",
    icon: "https://garden-finance.imgix.net/starknet-logo.svg",
  },
  [BlockchainType.solana]: {
    name: "solana",
    icon: "https://garden-finance.imgix.net/chain_images/solana.png",
  },
  [BlockchainType.sui]: {
    name: "sui",
    icon: "https://garden-finance.imgix.net/chain_images/sui.svg",
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
}

// Wallet capabilities interface
interface WalletCapabilities {
  [BlockchainType.bitcoin]?: boolean;
  [BlockchainType.evm]?: boolean;
  [BlockchainType.starknet]?: boolean;
  [BlockchainType.solana]?: boolean;
  [BlockchainType.sui]?: boolean;
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
  isBitcoinSupported: capabilities[BlockchainType.bitcoin] ?? false,
  isEVMSupported: capabilities[BlockchainType.evm] ?? false,
  isStarknetSupported: capabilities[BlockchainType.starknet] ?? false,
  isSolanaSupported: capabilities[BlockchainType.solana] ?? false,
  isSuiSupported: capabilities[BlockchainType.sui] ?? false,
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
    { evm: true }
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
    "wallets/phantomDark.svg",
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
      sui: network === Network.MAINNET,
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
    "Ready Wallet (formerly Argent)",
    "wallet/argent.svg",
    "https://www.argent.xyz/argent-x",
    { starknet: true }
  ),
  keplr: createWallet("keplr", "Keplr", "wallets/keplr.svg", "tallLink:", {
    evm: network === Network.MAINNET,
    starknet: true,
    bitcoin: network === Network.MAINNET,
  }),
  leap: createWallet(
    "leap",
    "Leap Wallet",
    "wallets/LeapLight.svg",
    "https://www.leapwallet.io/",
    {
      evm: network === Network.MAINNET,
    }
  ),
  xverse: createWallet(
    "xverse",
    "Xverse",
    "wallets/xverse.svg",
    "https://www.xverse.app/download",
    { bitcoin: true }
  ),
  solflare: createWallet(
    "solflare",
    "Solflare",
    "wallets/Solflare.svg",
    "https://www.solflare.com/",
    { solana: true }
  ),
  "app.backpack": createWallet(
    "app.backpack",
    "Backpack",
    "wallets/Backpack.svg",
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
    "wallets/SlushLogo.png",
    "https://slushwallet.com/",
    { sui: true }
  ),
};
