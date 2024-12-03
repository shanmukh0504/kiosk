import { modalNames, modalStore } from "../../store/modalStore";
import { AssetList } from "./AssetList";
import { ConnectWallet } from "../navbar/ConnectWallet";
import { TransactionsComponent } from "../transactions/TransactionsComponent";
import { WhiteList } from "../whitelist/WhiteList";
import { InitializeSMModal } from "./InitializeSMModal";

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
      {/* <WhiteList
        open={modalName.whiteList}
        onClose={() => setCloseModal(modalNames.whiteList)}
      /> */}
      <AssetList
        open={modalName.assetList}
        onClose={() => setCloseModal(modalNames.assetList)}
      />
    </>
  );
};
