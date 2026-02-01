import { create } from "zustand";

/** Mock wallet addresses for visual/E2E tests when VITE_EXPOSE_STORES_FOR_TESTS=true */
export type MockWalletAddresses = {
  evm?: string | null;
  bitcoin?: string | null;
  litecoin?: string | null;
  starknet?: string | null;
  solana?: string | null;
  sui?: string | null;
  tron?: string | null;
  xrpl?: string | null;
};

type MockWalletStoreState = {
  addresses: MockWalletAddresses;
  setAddresses: (addresses: MockWalletAddresses) => void;
  clear: () => void;
};

export const mockWalletStore = create<MockWalletStoreState>((set) => ({
  addresses: {},
  setAddresses: (addresses) => set({ addresses }),
  clear: () => set({ addresses: {} }),
}));
