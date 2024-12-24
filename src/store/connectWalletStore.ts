import { create } from "zustand";

type ConnectWalletState = {
  isOpen: boolean;
  isBTCwallets: boolean;
  setIsOpen: () => void;
  setOpenBTCwallets: () => void;
  closeConnectWallet: () => void;
};

export const connectWalletStore = create<ConnectWalletState>((set) => ({
  isOpen: false,
  isBTCwallets: false,
  setIsOpen: () => set({ isOpen: true }),
  setOpenBTCwallets: () => set({ isBTCwallets: true, isOpen: true }),
  closeConnectWallet: () => set({ isOpen: false, isBTCwallets: false }),
}));
