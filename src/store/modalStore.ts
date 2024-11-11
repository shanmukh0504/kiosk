import { create } from "zustand";

export const modalNames = {
  connectWallet: "connectWallet",
  transactions: "transactions",
  initializeSM: "initializeSM",
  whiteList: "whiteList",
  assetList: "assetList",
} as const;

export type ModalName = keyof typeof modalNames;

type ModalState = {
  modalName: {
    [key in ModalName]: boolean;
  };
  setOpenModal: (name: ModalName) => void;
  setCloseModal: (name: ModalName) => void;
};

export const modalStore = create<ModalState>((set) => ({
  modalName: {
    connectWallet: false,
    transactions: false,
    initializeSM: false,
    whiteList: false,
    assetList: false,
  },
  setOpenModal: (name) => {
    set((state) => ({
      modalName: { ...state.modalName, [name]: true },
    }));
  },
  setCloseModal: (name) => {
    set((state) => ({
      modalName: { ...state.modalName, [name]: false },
    }));
  },
}));
