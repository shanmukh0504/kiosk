import { useEffect } from "react";
import { modalNames, modalStore } from "../../store/modalStore";
import { AssetList } from "./AssetList";
import { ConnectWallet } from "../navbar/connectWallet/ConnectWallet";
import { TransactionsComponent } from "../transactions/TransactionsComponent";
import { WhiteList } from "../whitelist/WhiteList";
import { connectWalletStore } from "../../store/connectWalletStore";

export const Modal = () => {
  const { modalName, setCloseModal } = modalStore();
  const { isOpen, isBTCwallets, closeConnectWallet } = connectWalletStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (modalName.transactions) setCloseModal(modalNames.transactions);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalName.transactions, setCloseModal]);

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
