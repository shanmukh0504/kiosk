import { FC } from "react";
import { AssetSelector } from "../swap/AssetSelector";
import { Modal } from "@gardenfi/garden-book";

type AssetListProps = {
  open: boolean;
  onClose: () => void;
};

export const AssetList: FC<AssetListProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Children
        opacityLevel={"medium"}
        className="flex flex-col gap-6 rounded-2xl"
      >
        <AssetSelector open={open} onClose={onClose} />
      </Modal.Children>
    </Modal>
  );
};
