import { modalNames, modalStore } from "../../store/modalStore";
import { ConnectWallet } from "../navbar/ConnectWalletModal";
import { TransactionsComponent } from "../transactions/TransactionsComponent";
import { InitializeSMModal } from "./InitializeSMModal";
import { WhiteListModal } from "./WhitelistModal";

export const Modal = () => {
  const { modalName, setCloseModal } = modalStore();

  return (
    <>
      <ConnectWallet
        open={modalName.connectWallet}
        onClose={() => setCloseModal(modalNames.connectWallet)}
      />
      <TransactionsComponent
        open={modalName.transactions}
        onClose={() => setCloseModal(modalNames.transactions)}
      />
      <InitializeSMModal
        open={modalName.initializeSM}
        onClose={() => setCloseModal(modalNames.initializeSM)}
      />
      <WhiteListModal
        open={modalName.whiteList}
        onClose={() => setCloseModal(modalNames.whiteList)}
      />
    </>
  );
};
