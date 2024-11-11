import { FC } from "react";
import { AssetSelector } from "../swap/AssetSelector";

type AssetListProps = {
  open: boolean;
  onClose: () => void;
};

export const AssetList: FC<AssetListProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div
      className={`bg-dark-grey
      absolute z-50
      h-full w-full
      transition-colors ease-cubic-in-out duration-500
      ${open ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}
    >
      <div className={`flex  justify-center items-center`}>
        <AssetSelector open={open} onClose={onClose} />
      </div>
    </div>
  );
};
