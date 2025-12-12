import { create } from "zustand";

export type WalletAddress = {
  source: string;
  destination: string;
};

type WalletAddressState = {
  address: WalletAddress;
  setAddress: (
    updates: Partial<WalletAddress> | ((prev: WalletAddress) => WalletAddress)
  ) => void;
  clearAddresses: () => void;
};

export const walletAddressStore = create<WalletAddressState>((set) => ({
  address: {
    source: "",
    destination: "",
  },
  setAddress: (updates) => {
    set((state) => {
      if (typeof updates === "function") {
        return {
          address: updates(state.address),
        };
      }
      return {
        address: {
          ...state.address,
          ...updates,
        },
      };
    });
  },
  clearAddresses: () => {
    set({
      address: {
        source: "",
        destination: "",
      },
    });
  },
}));
