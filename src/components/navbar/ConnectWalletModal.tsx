import { Modal } from "@gardenfi/garden-book";
import React from "react";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-white p-6">Connect Wallet</div>
    </Modal>
  );
};
