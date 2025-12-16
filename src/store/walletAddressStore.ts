import { create } from "zustand";

type WalletAddressState = {
  source: string | undefined;
  destination: string | undefined;
  setSource: (address: string | undefined) => void;
  setDestination: (address: string | undefined) => void;
  clearAddresses: () => void;
};

export const walletAddressStore = create<WalletAddressState>((set) => ({
  source: undefined,
  destination: undefined,
  setSource: (address) => {
    set({ source: address });
  },
  setDestination: (address) => {
    set({ destination: address });
  },
  clearAddresses: () => {
    set({
      source: undefined,
      destination: undefined,
    });
  },
}));
