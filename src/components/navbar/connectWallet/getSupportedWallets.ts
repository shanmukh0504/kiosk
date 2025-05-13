import {
  AvailableWallets,
  IInjectedBitcoinProvider,
} from "@gardenfi/wallet-connectors";
import { Connector } from "wagmi";
import { GetConnectorsReturnType } from "wagmi/actions";
import { evmToBTCid, GardenSupportedWallets } from "./constants";
import { Connector as StarknetConnector } from "@starknet-react/core";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";

export type Wallet = {
  id: string;
  name: string;
  logo: string;
  wallet: {
    evmWallet?: Connector;
    btcWallet?: IInjectedBitcoinProvider;
    starknetWallet?: StarknetConnector;
    solanaWallet?: SolanaWallet;
  };
  isAvailable: boolean;
  installLink?: string;
  isBitcoin: boolean;
  isEVM: boolean;
  isStarknet?: boolean;
  isSolana?: boolean;
};

export const getAvailableWallets = (
  btcWallets?: AvailableWallets,
  evmWallets?: GetConnectorsReturnType,
  starknetWallets?: StarknetConnector[],
  solanaWallets?: SolanaWallet[]
): Wallet[] => {
  const wallets: Wallet[] = [];

  if (evmWallets) {
    Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
      if (!value.isEVMSupported) return;
      if (key === "app.phantom") return;
      let wallet = evmWallets.find((w) => w.id === key);
      let isAvailable = !!wallet;
      const isInjected =
        typeof window !== "undefined" &&
        !!window.ethereum &&
        window.ethereum.isCoinbaseWallet;
      if (key === "com.coinbase.wallet" && !isAvailable) {
        isAvailable = isInjected;
        wallet = evmWallets.find((w) => w.id === "injected");
      }
      wallets.push({
        ...value,
        wallet: {
          evmWallet: wallet,
        },
        isAvailable,
        isBitcoin: false,
        isEVM: true,
      });
    });
  }

  Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
    if (!value.isBitcoinSupported) return;
    if (evmWallets && evmToBTCid[key]) {
      const walletIndex = wallets.findIndex((w) => w.id === key);
      if (walletIndex !== -1) {
        wallets[walletIndex].wallet.btcWallet = btcWallets?.[evmToBTCid[key]];
        wallets[walletIndex].isBitcoin = true;
      } else {
        wallets[walletIndex].isBitcoin = false;
      }

      return;
    }

    const wallet = btcWallets?.[key] ?? btcWallets?.[evmToBTCid[key]];
    wallets.push({
      ...value,
      wallet: {
        btcWallet: wallet,
      },
      isAvailable: !!wallet,
      isBitcoin: true,
      isEVM: false,
    });
  });

  if (starknetWallets) {
    Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
      if (!value.isStarknetSupported) return;
      const wallet = starknetWallets.find((w) => w.id === key);
      let isAvailable = false;
      if (typeof window !== "undefined") {
        if (key === "argentX" && window.starknet_argentX) {
          isAvailable = true;
        } else if (key === "braavos" && window.starknet_braavos) {
          isAvailable = true;
        } else if (key === "keplr" && window.starknet_keplr) {
          isAvailable = true;
        }
      }

      const existingWalletIndex = wallets.findIndex((w) => w.id === key);
      if (existingWalletIndex !== -1) {
        wallets[existingWalletIndex].wallet.starknetWallet = wallet;
        wallets[existingWalletIndex].isStarknet = true;
        wallets[existingWalletIndex].isAvailable = isAvailable;
      } else {
        wallets.push({
          ...value,
          wallet: {
            starknetWallet: wallet,
          },
          isAvailable,
          isBitcoin: false,
          isEVM: false,
          isStarknet: true,
        });
      }
    });
  }

  if (solanaWallets) {
    Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
      if (!value.isSolanaSupported) return;
      const normalizedKey = key === "app.phantom" ? "phantom" : key;
      const wallet = solanaWallets.find(
        (w) => w.adapter.name.toLowerCase() === normalizedKey.toLowerCase()
      );
      let isAvailable = false;

      if (typeof window !== "undefined") {
        if (key === "app.phantom" && window.phantom) {
          isAvailable = true;
        } else if (key === "solflare" && window.solflare) {
          isAvailable = true;
        } else if (key === "backpack" && window.backpack) {
          isAvailable = true;
        }
      }

      const existingWalletIndex = wallets.findIndex((w) => w.id === key);
      if (existingWalletIndex !== -1) {
        if (key === "app.phantom") {
          wallets[existingWalletIndex].wallet.solanaWallet = wallet;
          wallets[existingWalletIndex].isSolana = true;
          // Add EVM wallet if EVM is supported
          if (value.isEVMSupported && evmWallets) {
            const evmWallet = evmWallets.find((w) => w.id === "app.phantom");
            if (evmWallet) {
              wallets[existingWalletIndex].wallet.evmWallet = evmWallet;
              wallets[existingWalletIndex].isEVM = true;
            }
          }
          wallets[existingWalletIndex].isAvailable = isAvailable;
        }
      } else {
        const newWallet: Wallet = {
          ...value,
          wallet: {
            solanaWallet: wallet,
            evmWallet:
              value.isEVMSupported && evmWallets
                ? evmWallets.find((w) => w.id === "app.phantom")
                : undefined,
          },
          isAvailable,
          isBitcoin: false,
          isEVM:
            value.isEVMSupported &&
            !!evmWallets?.find((w) => w.id === "app.phantom"),
          isStarknet: false,
          isSolana: true,
        };

        wallets.push(newWallet);
      }
    });
  }

  return wallets.sort((a, b) => {
    if (a.id === "injected") return 1;
    if (b.id === "injected") return -1;
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return 0;
  });
};
