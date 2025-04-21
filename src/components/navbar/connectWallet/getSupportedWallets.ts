import {
  AvailableWallets,
  IInjectedBitcoinProvider,
} from "@gardenfi/wallet-connectors";
import { Connector } from "wagmi";
import { GetConnectorsReturnType } from "wagmi/actions";
import { evmToBTCid, GardenSupportedWallets } from "./constants";
import { Connector as StarknetConnector } from "@starknet-react/core";

export type Wallet = {
  id: string;
  name: string;
  logo: string;
  wallet: {
    evmWallet?: Connector;
    btcWallet?: IInjectedBitcoinProvider;
    starknetWallet?: StarknetConnector;
  };
  isAvailable: boolean;
  installLink?: string;
  isBitcoin: boolean;
  isEVM: boolean;
  isStarknet?: boolean;
};

export const getAvailableWallets = (
  btcWallets?: AvailableWallets,
  evmWallets?: GetConnectorsReturnType,
  starknetWallets?: StarknetConnector[]
): Wallet[] => {
  const wallets: Wallet[] = [];

  if (evmWallets) {
    Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
      if (!value.isEVMSupported) return;
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

  return wallets.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
};
