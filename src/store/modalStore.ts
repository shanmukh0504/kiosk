import { create } from "zustand";

export const modalNames = {
  connectWallet: "connectWallet",
  transactions: "transactions",
  whiteList: "whiteList",
  assetList: "assetList",
  stakeSeed: "stakeSeed",
} as const;

export type ModalData = {
  connectWallet: { isBTCWallets: boolean };
  stakeSeed: {
    isStake: boolean;
    isExtend: boolean;
  };
  transactions: undefined;
  initializeSM: undefined;
  whiteList: undefined;
  assetList: undefined;
};

export type ModalName = keyof typeof modalNames;

type ModalState = {
  modalName: {
    [key in ModalName]: boolean;
  };
  modalData: {
    [key in ModalName]?: ModalData[key];
  };
  setOpenModal: <T extends ModalName>(name: T, data?: ModalData[T]) => void;
  setCloseModal: (name: ModalName) => void;
};

export const modalStore = create<ModalState>((set) => ({
  modalName: {
    connectWallet: false,
    transactions: false,
    initializeSM: false,
    whiteList: false,
    assetList: false,
    stakeSeed: false,
  },
  modalData: {},
  setOpenModal: (name, data) => {
    set((state) => ({
      modalName: { ...state.modalName, [name]: true },
      modalData: { ...state.modalData, [name]: data },
    }));
  },
  setCloseModal: (name) => {
    set((state) => ({
      modalName: { ...state.modalName, [name]: false },
      modalData: { ...state.modalData, [name]: undefined },
    }));
  },
}));
