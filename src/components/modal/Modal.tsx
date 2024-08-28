import { modalNames, modalStore } from "../../store/modalStore";
import { ConnectWallet } from "../navbar/ConnectWalletModal";

export const Modal = () => {
  const { modalName, setCloseModal } = modalStore();

  return (
    <>
      <ConnectWallet
        open={modalName.connectWallet}
        onClose={() => setCloseModal(modalNames.connectWallet)}
      />
    </>
  );
};
