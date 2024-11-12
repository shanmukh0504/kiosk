import { FC, useEffect, useMemo } from "react";
import { useViewport } from "../../hooks/useViewport";
import { BREAKPOINTS } from "../../constants/constants";
import { WhiteListModal } from "./WhiteListModal";
import { WhiteListBottomSheet } from "./WhiteListBottomSheet";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";

type WhiteListProps = {
  open: boolean;
  onClose: () => void;
};

export const WhiteList: FC<WhiteListProps> = ({ open, onClose }) => {
  const { address, disconnect } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { width } = useViewport();
  const isSmall = useMemo(() => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || width < BREAKPOINTS.sm;
  }, [width]);

  const handleJoinWaitlist = () =>
    window.open("https://waitlist.garden.finance", "_blank");

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  useEffect(() => {
    if (!address) return;
    checkIfWhitelisted(address).then((isWhitelisted) => {
      if (!isWhitelisted) {
        setOpenModal(modalNames.whiteList);
      }
    });
  }, [address, setOpenModal]);

  return (
    <div>
      {isSmall ? (
        <WhiteListBottomSheet
          open={open}
          onClose={onClose}
          handleJoinWaitlist={handleJoinWaitlist}
          handleDisconnect={handleDisconnect}
        />
      ) : (
        <WhiteListModal
          open={open}
          onClose={onClose}
          handleJoinWaitlist={handleJoinWaitlist}
          handleDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
};
