import { create } from "zustand";
import { StakingPosition } from "./stakeStore";
enum BlockchainType {
  bitcoin = "bitcoin",
  evm = "evm",
  solana = "solana",
  starknet = "starknet",
  sui = "sui",
  tron = "tron",
}

export const modalNames = {
  connectWallet: "connectWallet",
  transactions: "transactions",
  assetList: "assetList",
  manageStake: "manageStake",
} as const;

export type ModalData = {
  connectWallet: {
    [key in BlockchainType]?: boolean;
  };
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
  assetList: undefined;
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
    assetList: false,
    manageStake: false,
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
