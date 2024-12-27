import { useEffect } from "react";
import { modalNames, modalStore } from "../../store/modalStore";
import { ConnectWallet } from "../navbar/connectWallet/ConnectWallet";
import { TransactionsComponent } from "../transactions/TransactionsComponent";
import { InitializeSMModal } from "./InitializeSMModal";
import { ResponsiveModal } from "./ResponsiveModal";
import { AssetSelector } from "../swap/AssetSelector";
import { StakeSeed } from "../stake/StakeSeed";
import { Whitelist } from "../whitelist/WhiteList";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
};

export const Modal = () => {
  const { modalName, setCloseModal } = modalStore();

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
      <ResponsiveModal
        open={modalName.connectWallet}
        onClose={() => setCloseModal(modalNames.connectWallet)}
      >
        <ConnectWallet
          open={modalName.connectWallet}
          onClose={() => setCloseModal(modalNames.connectWallet)}
        />
      </ResponsiveModal>

      <TransactionsComponent
        open={modalName.transactions}
        onClose={() => setCloseModal(modalNames.transactions)}
      />

      <InitializeSMModal
        open={modalName.initializeSM}
        onClose={() => setCloseModal(modalNames.initializeSM)}
      />

      <ResponsiveModal
        open={modalName.whiteList}
        onClose={() => setCloseModal(modalNames.whiteList)}
      >
        <Whitelist
          open={modalName.whiteList}
          onClose={() => setCloseModal(modalNames.whiteList)}
        />
      </ResponsiveModal>

      <ResponsiveModal
        open={modalName.assetList}
        onClose={() => setCloseModal(modalNames.assetList)}
      >
        <AssetSelector onClose={() => setCloseModal(modalNames.assetList)} />
      </ResponsiveModal>

      <ResponsiveModal
        open={modalName.stakeSeed}
        onClose={() => setCloseModal(modalNames.stakeSeed)}
      >
        <StakeSeed onClose={() => setCloseModal(modalNames.stakeSeed)} />
      </ResponsiveModal>
    </>
  );
};
