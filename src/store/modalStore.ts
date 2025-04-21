import { create } from "zustand";
import { StakingPosition } from "./stakeStore";

export const modalNames = {
  connectWallet: "connectWallet",
  transactions: "transactions",
  whiteList: "whiteList",
  assetList: "assetList",
  manageStake: "manageStake",
  versionUpdate: "versionUpdate",
} as const;

export type ModalData = {
  connectWallet: { isBTCWallets: boolean };
  manageStake: {
    stake?: {
      isStake: boolean;
      amount: string;
    };
    extend?: {
      isExtend: boolean;
      stakingPosition: StakingPosition;
    };
    restake?: {
      isRestake: boolean;
      stakingPosition: StakingPosition;
    };
  };
  transactions: undefined;
  initializeSM: undefined;
  whiteList: undefined;
  assetList: undefined;
  versionUpdate: undefined;
};

export type ModalName = keyof typeof modalNames;

type ModalState = {
  modalName: {
    [key in ModalName]: boolean;
  };
  modalData: {
    [K in ModalName]?: ModalData[K];
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
    manageStake: false,
    versionUpdate: false,
  },
  modalData: {
    manageStake: {},
  },
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
