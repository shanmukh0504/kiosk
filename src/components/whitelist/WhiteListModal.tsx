import { FC } from "react";
import { useViewport } from "../../hooks/useViewport";
import { BREAKPOINTS } from "../../constants/constants";
import { WhiteList } from "./WhiteList";
import { WhiteListBottomSheet } from "./WhiteListBottomSheet";

type WhiteListModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WhiteListModal: FC<WhiteListModalProps> = ({ open, onClose }) => {
  const { width } = useViewport();
  const isSmall = width < BREAKPOINTS.sm;

  return (
    <div>
      {isSmall ? (
        <WhiteListBottomSheet open={open} onClose={onClose} />
      ) : (
        <WhiteList open={open} onClose={onClose} />
      )}
    </div>
  );
};
