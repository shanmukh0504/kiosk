import { create } from 'zustand';

export const modalNames = {
  connectWallet: "connectWallet",
  referralModal: "referralModal",
  feedbackForm: "feedbackForm",
  accessCode: "accessCode",
  orderDetails: "orderDetails",
  stakeSeed: "stakeSeed",
  manageStake: "manageStake",
  seedInfo: "seedInfo",
  bandIt: "bandIt",
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
    referralModal: false,
    feedbackForm: false,
    accessCode: false,
    orderDetails: false,
    stakeSeed: false,
    manageStake: false,
    seedInfo: false,
    bandIt: false,
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
