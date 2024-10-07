import { CloseIcon, Modal, TrustWallet, Typography } from "@gardenfi/garden-book";
import React from "react";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  open,
  onClose,
}) => {
  const wallets = ["MetaMask", "Phantom"];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6 bg-white/50 backdrop-blur-[20px] rounded-2xl w-[600px] p-6">
        <div className="flex justify-between items-center">
          <Typography size="h4" weight="bold">
            Connect a wallet
          </Typography>
          <CloseIcon
            className="w-6 h-[14px] cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
          {wallets?.map((w, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <TrustWallet />
              <Typography size="h2" weight="medium">
                {w}
              </Typography>
            </div>
          ))}
        </div>
        <div className="mb-2">
          <Typography size="h4" weight="medium">
            By connecting a wallet, you agree to Garden’s Terms of Service and Privacy Policy.
          </Typography>
        </div>
      </div>
    </Modal>
  );
};
