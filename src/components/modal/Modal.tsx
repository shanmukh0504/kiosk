import { modalNames, modalStore } from "../../store/modalStore";
import { AssetList } from "./AssetList";
import { ConnectWallet } from "../navbar/connectWallet/ConnectWallet";
import { TransactionsComponent } from "../transactions/TransactionsComponent";
import { WhiteList } from "../whitelist/WhiteList";
import { InitializeSMModal } from "./InitializeSMModal";
import { connectWalletStore } from "../../store/connectWalletStore";

export const Modal = () => {
  const { modalName, setCloseModal } = modalStore();
  const { isOpen, isBTCwallets, closeConnectWallet } = connectWalletStore();

  return (
    <>
      <ConnectWallet
        open={isOpen}
        onClose={() => closeConnectWallet()}
        isBTCWallets={isBTCwallets}
      />
      <TransactionsComponent
        open={modalName.transactions}
        onClose={() => setCloseModal(modalNames.transactions)}
      />
      <InitializeSMModal
        open={modalName.initializeSM}
        onClose={() => setCloseModal(modalNames.initializeSM)}
      />
      <WhiteList
        open={modalName.whiteList}
        onClose={() => setCloseModal(modalNames.whiteList)}
      />
      <AssetList
        open={modalName.assetList}
        onClose={() => setCloseModal(modalNames.assetList)}
      />
    </>
  );
};
