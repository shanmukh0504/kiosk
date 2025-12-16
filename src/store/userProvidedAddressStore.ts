import { create } from "zustand";

type UserProvidedAddressState = {
  source: string | undefined;
  destination: string | undefined;
  setSource: (address: string | undefined) => void;
  setDestination: (address: string | undefined) => void;
  setAddress: (
    updates: Partial<{
      source: string | undefined;
      destination: string | undefined;
    }>
  ) => void;
  clearAddresses: () => void;
};

export const userProvidedAddressStore = create<UserProvidedAddressState>(
  (set) => ({
    source: undefined,
    destination: undefined,
    setSource: (address) => {
      set({ source: address });
    },
    setDestination: (address) => {
      set({ destination: address });
    },
    setAddress: (updates) => {
      set((state) => ({
        ...state,
        ...updates,
      }));
    },
    clearAddresses: () => {
      set({
        source: undefined,
        destination: undefined,
      });
    },
  })
);
