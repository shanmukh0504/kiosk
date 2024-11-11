import { modalNames, modalStore } from "../../store/modalStore";
import { ConnectWallet } from "../navbar/ConnectWalletModal";
import { Sidebar } from "../sidebar/Sidebar";
import { WhiteListModal } from "../whitelist/WhiteListModal";
import { InitializeSMModal } from "./InitializeSMModal";

export const Modal = () => {
  const { modalName, setCloseModal } = modalStore();

  return (
    <>
      <ConnectWallet
        open={modalName.connectWallet}
        onClose={() => setCloseModal(modalNames.connectWallet)}
      />
      <Sidebar
        open={modalName.transactionsSideBar}
        onClose={() => setCloseModal(modalNames.transactionsSideBar)}
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
