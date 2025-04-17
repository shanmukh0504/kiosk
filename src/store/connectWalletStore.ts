import { create } from "zustand";

type ConnectingWalletState = {
  connectingWallet: string | null;
  setConnectingWallet: (isConnectingWallet: string | null) => void;
};

export const ConnectingWalletStore = create<ConnectingWalletState>((set) => ({
  connectingWallet: null,
  setConnectingWallet: (connectingWallet) => set({ connectingWallet }),
}));
