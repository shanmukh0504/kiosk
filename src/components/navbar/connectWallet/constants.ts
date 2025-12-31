import { Network } from "@gardenfi/utils";
import { network } from "../../../constants/constants";
import { BlockchainType } from "@gardenfi/orderbook";

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
    icon: "https://garden.imgix.net/chain_images/TronIcon.svg",
  },
} as const;

export type EcosystemKeys = keyof typeof ecosystems;
interface BaseWallet {
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
  name: string,
  logoPath: string,
  installLink: string,
  capabilities: WalletCapabilities
): GardenSupportedWalletsType => ({
  name,
  logo: `https://garden.imgix.net/${logoPath}`,
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
    "Injected",
    "wallets/injected.svg",
    "https://metamask.io/download/",
    { evm: true }
  ),
  metamask: createWallet(
    "Metamask",
    "wallets/metamask.svg",
    "https://metamask.io/download/",
    {
      evm: true,
      solana: true,
    }
  ),
  brave: createWallet(
    "Brave Wallet",
    "wallets/brave.svg",
    "https://brave.com/en-in/wallet/",
    { evm: true }
  ),
  phantom: createWallet(
    "Phantom",
    "wallets/phantomDark.svg",
    "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
    {
      evm: network === Network.MAINNET,
      bitcoin: network === Network.MAINNET,
      solana: true,
      // sui: true,
    }
  ),
  coinbase: createWallet(
    "Coinbase Wallet",
    "wallets/coinbase.svg",
    "https://www.coinbase.com/wallet/downloads",
    { evm: true }
  ),
  okx: createWallet(
    "OKX Wallet",
    "wallets/okx.svg",
    "https://www.okx.com/download",
    {
      bitcoin: network === Network.MAINNET,
      evm: true,
      starknet: network === Network.MAINNET,
      solana: true,
      tron: network === Network.MAINNET,
      // sui: network === Network.MAINNET,
    }
  ),
  unisat: createWallet("Unisat", "wallets/unisat.svg", "https://unisat.io/", {
    bitcoin: true,
  }),
  rabby: createWallet(
    "Rabby Wallet",
    "wallets/rabby.svg",
    "https://rabby.io/",
    { evm: true }
  ),
  braavos: createWallet(
    "Braavos",
    "wallet/braavos.svg",
    "https://braavos.app/",
    { starknet: true }
  ),
  ready: createWallet(
    "Ready Wallet (formerly Argent)",
    "wallet/argent.svg",
    "https://www.argent.xyz/argent-x",
    { starknet: true }
  ),
  keplr: createWallet("Keplr", "wallets/keplr.svg", "tallLink:", {
    evm: network === Network.MAINNET,
    starknet: true,
    bitcoin: network === Network.MAINNET,
  }),
  leap: createWallet(
    "Leap Wallet",
    "wallets/LeapLight.svg",
    "https://www.leapwallet.io/",
    {
      evm: network === Network.MAINNET,
    }
  ),
  xverse: createWallet(
    "Xverse",
    "wallets/xverse.svg",
    "https://www.xverse.app/download",
    { bitcoin: true }
  ),
  solflare: createWallet(
    "Solflare",
    "wallets/Solflare.svg",
    "https://www.solflare.com/",
    { solana: true }
  ),
  backpack: createWallet(
    "Backpack",
    "wallets/Backpack.svg",
    "https://backpack.app/",
    {
      solana: network === Network.MAINNET,
      evm: network === Network.MAINNET,
      // sui: network === Network.MAINNET,
    }
  ),
  // slush: createWallet(
  //   "Slush Wallet",
  //   "wallets/SlushLogo.png",
  //   "https://slushwallet.com/",
  //   { sui: true }
  // ),
  // tokeo: createWallet(
  //   "Tokeo",
  //   "wallets/TokeoLogo.webp",
  //   "https://tokeo.io/",
  //   { sui: network === Network.MAINNET }
  // ),
  tronlink: createWallet(
    "tronlink",
    "wallets/TronLinkIcon.svg",
    "https://www.tronlink.org/",
    { tron: true }
  ),
};
