import { create } from "zustand";

export const modalNames = {
  connectWallet: "connectWallet",
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
    connectWallet: true,
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

export const openModal = modalStore.getState().setOpenModal;
export const closeModal = modalStore.getState().setCloseModal;
export const getModalState = modalStore.getState().modalName;
