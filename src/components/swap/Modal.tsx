import React from 'react';
import { modalStore, modalNames } from '../../store/modalStore';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  overlayBackground?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, overlayBackground, children }) => {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${overlayBackground || "bg-black bg-opacity-50"}`}>
      <div className="bg-white p-4 rounded-md shadow-lg">
        <button onClick={onClose} className="absolute top-2 right-2">Close</button>
        {children}
      </div>
    </div>
  );
};

export const WalletModal: React.FC = () => {
  const isOpen = modalStore((state) => state.modalName.connectWallet);
  const closeModal = modalStore((state) => state.setCloseModal);

  const handleModalClose = () => {
    closeModal(modalNames.connectWallet);
  };

  return (
    <Modal open={isOpen} onClose={handleModalClose}>
      <div>Wallet Modal Content</div>
    </Modal>
  );
};

export const ReferralModal: React.FC = () => {
  const isOpen = modalStore((state) => state.modalName.referralModal);
  const closeModal = modalStore((state) => state.setCloseModal);

  const handleModalClose = () => {
    closeModal(modalNames.referralModal);
  };

  return (
    <Modal open={isOpen} onClose={handleModalClose}>
      <div>Referral Modal Content</div>
    </Modal>
  );
};
