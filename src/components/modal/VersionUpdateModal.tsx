import React from "react";
import { Button, Typography, WarningIcon } from "@gardenfi/garden-book";
import { CloseIcon } from "@gardenfi/garden-book";
import { modalNames, modalStore } from "../../store/modalStore";

type VersionUpdateModalProps = {
  onClose: () => void;
};

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  onClose,
}) => {
  const { setOpenModal } = modalStore();

  const handleChangeWallet = () => {
    setOpenModal(modalNames.connectWallet);
    onClose();
  };

  return (
    <div className="mt-2 flex max-w-[440px] flex-col gap-8 rounded-2xl p-1">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WarningIcon className="h-4 w-4" />
            <Typography size="h4" weight="medium">
              Update required
            </Typography>
          </div>
          <CloseIcon
            className="h-[14px] w-[14px] cursor-pointer"
            onClick={onClose}
          />
        </div>
        <Typography size="h4" className="w-[90%]">
          Your MetaMask wallet version (12.15.1) is outdated and may not
          function properly. Please update to the latest version to continue.
        </Typography>
      </div>
      <div className="flex w-full gap-2">
        <Button
          variant="primary"
          className="w-full !bg-white !text-dark-grey"
          onClick={handleChangeWallet}
        >
          Change wallet
        </Button>
        <Button
          variant="primary"
          className="w-full"
          onClick={() =>
            window.open(
              "https://support.metamask.io/configure/wallet/how-to-update-the-version-of-metamask/",
              "_blank"
            )
          }
        >
          Learn more
        </Button>
      </div>
    </div>
  );
};
