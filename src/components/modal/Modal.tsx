import { modalNames, modalStore } from "../../store/modalStore";
import { ConnectWallet } from "../navbar/ConnectWalletModal";

export const Modal = () => {
  const isOpen = modalStore((state) => state.modalName);
  const closeModal = modalStore((state) => state.setCloseModal);

  return (
    <>
      <ConnectWallet
        open={isOpen.connectWallet}
        onClose={() => closeModal(modalNames.connectWallet)}
      />
    </>
  );
};
