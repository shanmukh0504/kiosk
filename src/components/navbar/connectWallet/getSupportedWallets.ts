import {
  AvailableBTCWallets,
  AvailableLTCWallets,
  IInjectedBitcoinProvider,
  IInjectedLitecoinProvider,
} from "@gardenfi/wallet-connectors";
import { Connector } from "wagmi";
import { GetConnectorsReturnType } from "wagmi/actions";
import { GardenSupportedWallets } from "./constants";
import { Connector as StarknetConnector } from "@starknet-react/core";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";
import { WalletWithRequiredFeatures as SuiWallet } from "@mysten/wallet-standard";
import { Wallet as TronWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
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
    tronWallet?: TronWallet;
    litecoinWallet?: IInjectedLitecoinProvider;
  };
  isAvailable: boolean;
  installLink?: string;
  isBitcoin: boolean;
  isEVM: boolean;
  isStarknet?: boolean;
  isSolana?: boolean;
  isSui?: boolean;
  isTron?: boolean;
  isLitecoin?: boolean;
  isXRPL?: boolean;
  isSpark?: boolean;
};

export type ConnectionState = {
  btcProvider?: IInjectedBitcoinProvider;
  litecoinProvider?: IInjectedLitecoinProvider;
  evmConnector?: Connector;
  starknetConnector?: StarknetConnector;
  starknetStatus?: string;
  solanaConnected?: boolean;
  solanaSelectedWallet?: SolanaWallet | null;
  suiConnected?: boolean;
  suiSelectedWallet?: SuiWallet | null;
  tronConnected?: boolean;
  tronSelectedWallet?: TronWallet | null;
  xrplConnected?: boolean;
  xrplAddress?: string;
};

const checkManualWalletAvailability = (
  walletKey: string
): boolean | undefined => {
  if (typeof window === "undefined") return undefined;
  switch (walletKey) {
    case "keplr":
      return !!window.keplr && !!window.starknet_keplr;
    case "backpack":
      return !!window.backpack;
    case "leap":
      return !!window.leap;
    case "braavos":
      return !!window.starknet_braavos;
    case "ready":
      return !!window.starknet_argentX;
    case "crossmark":
      return !!window.xrpl && !!window.crossmark;
    default:
      return undefined;
  }
};

const getWalletKey = (connectorName: string): string => {
  return connectorName
    .toLowerCase()
    .replace(/\s*wallet$/i, "")
    .trim()
    .split(/\s+/)[0];
};

export const getAvailableWallets = (
  bitcoinWallets?: AvailableBTCWallets,
  litecoinWallets?: AvailableLTCWallets,
  evmWallets?: GetConnectorsReturnType,
  starknetWallets?: StarknetConnector[],
  solanaWallets?: SolanaWallet[],
  suiWallets?: SuiWallet[],
  tronWallets?: TronWallet[]
): Wallet[] => {
  const walletMap = new Map<string, Wallet>();

  for (const [key, config] of Object.entries(GardenSupportedWallets)) {
    walletMap.set(key, {
      id: key,
      name: config.name,
      logo: config.logo,
      wallet: {},
      isAvailable: false,
      installLink: config.installLink,
      isBitcoin: config.isBitcoinSupported,
      isEVM: config.isEVMSupported,
      isStarknet: config.isStarknetSupported,
      isSolana: config.isSolanaSupported,
      isSui: config.isSuiSupported,
      isTron: config.isTronSupported,
      isLitecoin: config.isLitecoinSupported,
      isXRPL: config.isXRPLSupported,
      isSpark: false,
    });
  }

  const getWallet = (connectorName: string): Wallet | undefined => {
    return walletMap.get(getWalletKey(connectorName));
  };

  if (evmWallets) {
    for (const connector of evmWallets) {
      const wallet = getWallet(connector.name);
      if (wallet && wallet.isEVM) {
        wallet.wallet.evmWallet = connector;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  if (bitcoinWallets) {
    for (const [_, provider] of Object.entries(bitcoinWallets)) {
      const wallet = getWallet(provider.name);
      if (wallet && wallet.isBitcoin) {
        wallet.wallet.btcWallet = provider;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  if (litecoinWallets) {
    for (const [_, provider] of Object.entries(litecoinWallets)) {
      const wallet = getWallet(provider.name);
      if (wallet && wallet.isLitecoin) {
        wallet.wallet.litecoinWallet = provider;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  if (starknetWallets) {
    for (const connector of starknetWallets) {
      const wallet = getWallet(connector.name);
      if (wallet && wallet.isStarknet) {
        wallet.wallet.starknetWallet = connector;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  if (solanaWallets) {
    for (const solWallet of solanaWallets) {
      const wallet = getWallet(solWallet.adapter.name);
      if (wallet && wallet.isSolana) {
        wallet.wallet.solanaWallet = solWallet;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  if (suiWallets) {
    for (const suiWallet of suiWallets) {
      const wallet = getWallet(suiWallet.name);
      if (wallet && wallet.isSui) {
        wallet.wallet.suiWallet = suiWallet;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  if (tronWallets) {
    for (const tronWallet of tronWallets) {
      const wallet = getWallet(tronWallet.adapter.name);
      if (wallet && wallet.isTron) {
        wallet.wallet.tronWallet = tronWallet;
        wallet.isAvailable = checkManualWalletAvailability(wallet.id) ?? true;
      }
    }
  }

  const crossmarkWallet = walletMap.get("crossmark");
  if (crossmarkWallet && crossmarkWallet.isXRPL) {
    crossmarkWallet.isAvailable =
      checkManualWalletAvailability("crossmark") ?? false;
  }

  return Array.from(walletMap.values()).sort((a, b) => {
    if (a.id === "injected") return 1;
    if (b.id === "injected") return -1;
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return 0;
  });
};

export const isWalletConnected = (
  wallet: Wallet,
  chain: BlockchainType,
  connectionState: ConnectionState
): boolean => {
  switch (chain) {
    case BlockchainType.bitcoin:
      if (!connectionState.btcProvider || !wallet.wallet.btcWallet)
        return false;
      return getWalletKey(connectionState.btcProvider.name) === wallet.id;

    case BlockchainType.litecoin:
      if (!connectionState.litecoinProvider || !wallet.wallet.litecoinWallet)
        return false;
      return getWalletKey(connectionState.litecoinProvider.name) === wallet.id;

    case BlockchainType.evm:
      if (!connectionState.evmConnector || !wallet.wallet.evmWallet)
        return false;
      return getWalletKey(connectionState.evmConnector.name) === wallet.id;

    case BlockchainType.starknet:
      if (
        !connectionState.starknetConnector ||
        !wallet.wallet.starknetWallet ||
        connectionState.starknetStatus !== "connected"
      )
        return false;
      return getWalletKey(connectionState.starknetConnector.name) === wallet.id;

    case BlockchainType.solana:
      if (
        !connectionState.solanaConnected ||
        !wallet.wallet.solanaWallet ||
        !connectionState.solanaSelectedWallet
      )
        return false;
      return (
        getWalletKey(connectionState.solanaSelectedWallet.adapter.name) ===
        wallet.id
      );

    case BlockchainType.sui:
      if (
        !connectionState.suiConnected ||
        !wallet.wallet.suiWallet ||
        !connectionState.suiSelectedWallet
      )
        return false;
      return getWalletKey(connectionState.suiSelectedWallet.name) === wallet.id;

    case BlockchainType.tron:
      if (
        !connectionState.tronConnected ||
        !wallet.wallet.tronWallet ||
        !connectionState.tronSelectedWallet
      )
        return false;
      return (
        getWalletKey(connectionState.tronSelectedWallet.adapter.name) ===
        wallet.id
      );
    case BlockchainType.xrpl:
      if (!connectionState.xrplConnected || !connectionState.xrplAddress)
        return false;
      return wallet.id === "crossmark";
    default:
      return false;
  }
};

export const getWalletConnectionStatus = (
  wallet: Wallet,
  connectionState: ConnectionState
): Record<BlockchainType, boolean> => {
  return {
    [BlockchainType.bitcoin]: isWalletConnected(
      wallet,
      BlockchainType.bitcoin,
      connectionState
    ),
    [BlockchainType.litecoin]: isWalletConnected(
      wallet,
      BlockchainType.litecoin,
      connectionState
    ),
    [BlockchainType.evm]: isWalletConnected(
      wallet,
      BlockchainType.evm,
      connectionState
    ),
    [BlockchainType.starknet]: isWalletConnected(
      wallet,
      BlockchainType.starknet,
      connectionState
    ),
    [BlockchainType.solana]: isWalletConnected(
      wallet,
      BlockchainType.solana,
      connectionState
    ),
    [BlockchainType.sui]: isWalletConnected(
      wallet,
      BlockchainType.sui,
      connectionState
    ),
    [BlockchainType.tron]: isWalletConnected(
      wallet,
      BlockchainType.tron,
      connectionState
    ),
    [BlockchainType.xrpl]: isWalletConnected(
      wallet,
      BlockchainType.xrpl,
      connectionState
    ),
    [BlockchainType.alpen_signet]: false,
    [BlockchainType.spark]: false,
  };
};
