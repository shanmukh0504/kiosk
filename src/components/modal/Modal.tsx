import { useEffect } from "react";
import { modalNames, modalStore } from "../../store/modalStore";
import { ConnectWallet } from "../navbar/connectWallet/ConnectWallet";
import { TransactionsComponent } from "../transactions/TransactionsComponent";
import { ResponsiveModal } from "./ResponsiveModal";
import { AssetSelector } from "../swap/AssetSelector";
import { Whitelist } from "../whitelist/WhiteList";
import { StakeModal } from "../stake/modal/StakeModal";
import { VersionUpdateModal } from "./VersionUpdateModal";

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
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
      <ResponsiveModal open={modalName.whiteList}>
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
        open={modalName.manageStake}
        onClose={() => setCloseModal(modalNames.manageStake)}
      >
        <StakeModal onClose={() => setCloseModal(modalNames.manageStake)} />
      </ResponsiveModal>

      <ResponsiveModal
        open={modalName.versionUpdate}
        opacityLevel={"semi-dark"}
        onClose={() => setCloseModal(modalNames.versionUpdate)}
      >
        <VersionUpdateModal
          onClose={() => setCloseModal(modalNames.versionUpdate)}
        />
      </ResponsiveModal>
    </>
  );
};
