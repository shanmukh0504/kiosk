import { FC, useMemo } from "react";
import { AssetSelector } from "../swap/AssetSelector";
import { Modal } from "@gardenfi/garden-book";
import { useViewport } from "../../hooks/useViewport";
import { BREAKPOINTS } from "../../constants/constants";
import { BottomSheet } from "../../common/BottomSheet";

type AssetListProps = {
  open: boolean;
  onClose: () => void;
};

export const AssetList: FC<AssetListProps> = ({ open, onClose }) => {
  const { width } = useViewport();
  const isMobile = useMemo(() => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || width < BREAKPOINTS.sm;
  }, [width]);

  return (
    <>
      {isMobile ? (
        <BottomSheet open={open} onOpenChange={onClose}>
          <AssetSelector onClose={onClose} />
        </BottomSheet>
      ) : (
        <Modal open={open} onClose={onClose}>
          <Modal.Children
            opacityLevel={"medium"}
            className="flex flex-col gap-6 rounded-2xl min-h-[452px] w-[480px] p-3"
          >
            <AssetSelector onClose={onClose} />
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
