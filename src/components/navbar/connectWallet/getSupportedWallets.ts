import {
  AvailableWallets,
  IInjectedBitcoinProvider,
} from "@gardenfi/wallet-connectors";
import { Connector } from "wagmi";
import { GetConnectorsReturnType } from "wagmi/actions";
import { evmToBTCid, GardenSupportedWallets } from "./constants";

export type Wallet = {
  id: string;
  name: string;
  logo: string;
  wallet: {
    evmWallet?: Connector;
    btcWallet?: IInjectedBitcoinProvider;
  };
  isAvailable: boolean;
  installLink?: string;
  isBitcoin: boolean;
  isEVM: boolean;
};

export const getAvailableWallets = (
  btcWallets: AvailableWallets,
  evmWallets?: GetConnectorsReturnType
): Wallet[] => {
  const wallets: Wallet[] = [];

  if (evmWallets) {
    Object.entries(GardenSupportedWallets).forEach(([key, value]) => {
      if (!value.isEVMSupported) return;
      const wallet = evmWallets.find((w) => w.id === key);

      wallets.push({
        ...value,
        wallet: {
          evmWallet: wallet,
        },
        isAvailable: !!wallet,
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
        wallets[walletIndex].wallet.btcWallet = btcWallets[evmToBTCid[key]];
        wallets[walletIndex].isBitcoin = true;
      } else {
        wallets[walletIndex].isBitcoin = false;
      }

      return;
    }

    const wallet = btcWallets[key] ?? btcWallets[evmToBTCid[key]];
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

  return wallets.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
};
