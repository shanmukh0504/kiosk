import {
  AvailableWallets,
  IInjectedBitcoinProvider,
} from "@gardenfi/wallet-connectors";
import { Connector } from "wagmi";
import { GetConnectorsReturnType } from "wagmi/actions";
import { evmToBTCid, GardenSupportedWallets } from "./constants";
import { Connector as StarknetConnector } from "@starknet-react/core";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";
import { WalletWithRequiredFeatures as SuiWallet } from "@mysten/wallet-standard";
import { BlockchainType } from "@gardenfi/orderbook";

export type Wallet = {
  id: string;
  name: string;
  logo: string;
  wallet: {
    evmWallet?: Connector;
    btcWallet?: IInjectedBitcoinProvider;
    starknetWallet?: StarknetConnector;
    solanaWallet?: SolanaWallet;
    suiWallet?: SuiWallet;
  };
  isAvailable: boolean;
  installLink?: string;
  isBitcoin: boolean;
  isEVM: boolean;
  isStarknet?: boolean;
  isSolana?: boolean;
  isSui?: boolean;
};

type WalletInputs = {
  bitcoinWallets?: AvailableWallets;
  evmWallets?: GetConnectorsReturnType;
  starknetWallets?: StarknetConnector[];
  solanaWallets?: SolanaWallet[];
  suiWallets?: SuiWallet[];
};
const blockchainConfigs = {
  [BlockchainType.evm]: {
    supportKey: "isEVMSupported" as const,
    walletKey: "evmWallet" as const,
    flagKey: "isEVM" as const,
    inputKey: "evmWallets" as const,
    finder: (wallets: GetConnectorsReturnType, key: string) =>
      wallets?.find((w) => w.id === key),
    availabilityChecker: (wallet: any, key: string) => {
      const manualCheck = manualEVMChecks[key];
      if (manualCheck) {
        return manualCheck.check();
      }
      return !!wallet;
    },
  },
  [BlockchainType.bitcoin]: {
    supportKey: "isBitcoinSupported" as const,
    walletKey: "btcWallet" as const,
    flagKey: "isBitcoin" as const,
    inputKey: "bitcoinWallets" as const,
    finder: (wallets: AvailableWallets, key: string) =>
      wallets?.[key] ?? wallets?.[evmToBTCid[key]],
    availabilityChecker: (wallet: any) => !!wallet,
  },
  [BlockchainType.starknet]: {
    supportKey: "isStarknetSupported" as const,
    walletKey: "starknetWallet" as const,
    flagKey: "isStarknet" as const,
    inputKey: "starknetWallets" as const,
    finder: (wallets: StarknetConnector[], key: string) =>
      wallets?.find((w) => w.id === key),
    availabilityChecker: (wallet: any, key: string) => {
      if (typeof window === "undefined") return false;
      const checks = {
        argentX: () => window.starknet_argentX,
        braavos: () => window.starknet_braavos,
        keplr: () => window.starknet_keplr,
        xverse: () => window.starknet_xverse,
      } as Record<string, () => unknown>;
      const manualCheck = checks[key];
      if (manualCheck) {
        return !!manualCheck();
      }
      return !!wallet;
    },
  },
  [BlockchainType.solana]: {
    supportKey: "isSolanaSupported" as const,
    walletKey: "solanaWallet" as const,
    flagKey: "isSolana" as const,
    inputKey: "solanaWallets" as const,
    finder: (wallets: SolanaWallet[], key: string) => {
      const normalizedKey =
        key === "app.phantom"
          ? "phantom"
          : key === "app.backpack"
            ? "backpack"
            : key;
      return wallets?.find(
        (w) => w.adapter.name.toLowerCase() === normalizedKey.toLowerCase()
      );
    },
    availabilityChecker: (wallet: any, key: string) => {
      if (typeof window === "undefined") return false;
      const checks = {
        "app.phantom": () => window.phantom,
        solflare: () => window.solflare,
        "app.backpack": () => window.backpack,
      } as Record<string, () => unknown>;
      const manualCheck = checks[key];
      if (manualCheck) {
        return !!manualCheck();
      }
      return !!wallet;
    },
  },
  [BlockchainType.sui]: {
    supportKey: "isSuiSupported" as const,
    walletKey: "suiWallet" as const,
    flagKey: "isSui" as const,
    inputKey: "suiWallets" as const,
    finder: (wallets: SuiWallet[], key: string) => {
      const walletNameMap = {
        slush: "com.mystenlabs.suiwallet",
        "app.phantom": "Phantom",
        "com.okex.wallet": "OKX Wallet",
        "app.backpack": "Backpack",
      } as Record<string, string>;

      if (key === "app.phantom") {
        return wallets?.find((w) => w.name === "Phantom");
      } else if (key === "com.okex.wallet") {
        return wallets?.find((w) => w.name === "OKX Wallet");
      } else if (key === "app.backpack") {
        return wallets?.find((w) => w.name === "Backpack");
      } else if (key === "tokeo") {
        return wallets?.find((w) => w.name === "Tokeo");
      } else {
        const walletId = walletNameMap[key] || key;
        return wallets?.find((w) => w.id === walletId);
      }
    },
    availabilityChecker: (wallet: any) => !!wallet,
  },
};

const manualEVMChecks: Record<
  string,
  { check: () => boolean; connectorId: string }
> = {
  "com.coinbase.wallet": {
    check: () =>
      !!(
        (window.ethereum && window.ethereum.isCoinbaseWallet) ||
        window.coinbaseWalletExtension
      ),
    connectorId: "injected",
  },
  keplr: {
    check: () =>
      !!window.keplr &&
      typeof window.keplr === "object" &&
      "ethereum" in window.keplr,
    connectorId: "keplr",
  },
  leap: {
    check: () =>
      !!window.leap &&
      typeof window.leap === "object" &&
      "ethereum" in window.leap,
    connectorId: "leap",
  },
  backpack: {
    check: () =>
      !!window.backpack &&
      typeof window.backpack === "object" &&
      "ethereum" in window.backpack,
    connectorId: "app.backpack",
  },
};

function createInitialWallet(config: any): Wallet {
  return {
    ...config,
    wallet: {},
    isAvailable: false,
    isBitcoin: false,
    isEVM: false,
    isStarknet: false,
    isSolana: false,
    isSui: false,
  };
}

function updateWalletWithBlockchain(
  wallet: Wallet,
  foundWallet: any,
  isAvailable: boolean,
  blockchain: BlockchainType
): void {
  const config = blockchainConfigs[blockchain];
  wallet.wallet[config.walletKey] = foundWallet;
  wallet[config.flagKey] = true;
  if (isAvailable) {
    wallet.isAvailable = true;
  }
}

function processBlockchainWallets(
  walletMap: Map<string, Wallet>,
  walletInputs: WalletInputs,
  blockchain: BlockchainType
): void {
  const config = blockchainConfigs[blockchain];
  const inputWallets = walletInputs[
    config.inputKey as keyof WalletInputs
  ] as unknown as
    | AvailableWallets
    | GetConnectorsReturnType
    | StarknetConnector[]
    | SolanaWallet[]
    | SuiWallet[]
    | undefined;

  if (!inputWallets && blockchain !== BlockchainType.bitcoin) return;

  Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
    if (!value[config.supportKey]) return;
    if (blockchain === BlockchainType.evm && key === "app.phantom") return;

    let foundWallet = config.finder(inputWallets as any, key);
    let isAvailable = config.availabilityChecker(foundWallet, key);

    const walletId = key;
    if (!walletMap.has(walletId)) {
      walletMap.set(walletId, createInitialWallet(value));
    }

    const wallet = walletMap.get(walletId);
    if (!wallet) return;
    updateWalletWithBlockchain(wallet, foundWallet, isAvailable, blockchain);
  });
}

// Multi-chain wallet configurations
const multiChainWallets = {
  "app.phantom": {
    solanaName: "phantom",
    suiName: "Phantom",
    bitcoinId: "phantom",
  },
  "app.backpack": {
    solanaName: "backpack",
    suiName: "Backpack",
  },
} as const;

function handleMultiChainWallets(
  walletMap: Map<string, Wallet>,
  walletInputs: WalletInputs
): void {
  Object.entries(multiChainWallets).forEach(([walletId, multiChainConfig]) => {
    const config = GardenSupportedWallets[walletId];
    if (!config) return;

    const evmWallet = config.isEVMSupported
      ? walletInputs.evmWallets?.find((w) => w.id === walletId)
      : undefined;

    const btcWallet =
      config.isBitcoinSupported && "bitcoinId" in multiChainConfig
        ? walletInputs.bitcoinWallets?.[multiChainConfig.bitcoinId]
        : undefined;

    const solanaWallet = config.isSolanaSupported
      ? walletInputs.solanaWallets?.find(
          (w) => w.adapter.name.toLowerCase() === multiChainConfig.solanaName
        )
      : undefined;

    const suiWallet = config.isSuiSupported
      ? walletInputs.suiWallets?.find(
          (w) => w.name === multiChainConfig.suiName
        )
      : undefined;

    const isEVM = !!evmWallet;
    const isBitcoin = !!btcWallet;
    const isSolana = !!solanaWallet;
    const isSui = !!suiWallet;
    const isAvailable = isEVM || isBitcoin || isSolana || isSui;

    if (isAvailable) {
      if (!walletMap.has(walletId)) {
        walletMap.set(walletId, createInitialWallet(config));
      }

      const wallet = walletMap.get(walletId);
      if (!wallet) return;
      wallet.wallet = {
        evmWallet,
        btcWallet,
        solanaWallet,
        suiWallet,
      };
      wallet.isEVM = isEVM;
      wallet.isBitcoin = isBitcoin;
      wallet.isSolana = isSolana;
      wallet.isSui = isSui;
      wallet.isAvailable = true;
    }
  });
}

export const getAvailableWallets = (
  bitcoinWallets?: AvailableWallets,
  evmWallets?: GetConnectorsReturnType,
  starknetWallets?: StarknetConnector[],
  solanaWallets?: SolanaWallet[],
  suiWallets?: SuiWallet[]
): Wallet[] => {
  const walletInputs: WalletInputs = {
    bitcoinWallets,
    evmWallets,
    starknetWallets,
    solanaWallets,
    suiWallets,
  };

  const walletMap = new Map<string, Wallet>();

  (
    [
      BlockchainType.evm,
      BlockchainType.bitcoin,
      BlockchainType.starknet,
      BlockchainType.solana,
      BlockchainType.sui,
    ] as const
  ).forEach((blockchain) => {
    processBlockchainWallets(walletMap, walletInputs, blockchain);
  });

  handleMultiChainWallets(walletMap, walletInputs);

  const wallets = Array.from(walletMap.values());

  return wallets.sort((a, b) => {
    if (a.id === "injected") return 1;
    if (b.id === "injected") return -1;
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return 0;
  });
};
