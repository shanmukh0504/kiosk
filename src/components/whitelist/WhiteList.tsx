import { FC, useEffect, useMemo } from "react";
import { useViewport } from "../../hooks/useViewport";

import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";
import blossomTestnet from "/blossom-testnet.png";
import blossomMainnet from "/blossom-mainnet.png";
import { Button, LogoutIcon, Modal, Typography } from "@gardenfi/garden-book";
import { BottomSheet } from "../../common/BottomSheet";
import { network } from "../../constants/constants";
import { swapStore } from "../../store/swapStore";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { balanceStore } from "../../store/balanceStore";

type WhiteListProps = {
  open: boolean;
  onClose: () => void;
};

const WhitelistComponent: FC<Omit<WhiteListProps, "open">> = ({ onClose }) => {
  const { disconnect } = useEVMWallet();
  const { clear } = swapStore();
  const { disconnect: btcDisconnect } = useBitcoinWallet();
  const { clearBalances } = balanceStore();
  const image = useMemo(
    () => (network === "mainnet" ? blossomMainnet : blossomTestnet),
    []
  );

  const handleJoinWaitlist = () =>
    window.open("https://waitlist.garden.finance", "_blank");

  const handleDisconnect = () => {
    clear();
    disconnect();
    onClose();
    btcDisconnect();
    clearBalances();
  };

  return (
    <div className="mt-2 flex flex-col gap-5 rounded-2xl p-1">
      <img src={image} alt="whitelist" />
      <Typography size="h4">
        <b>Bloom {network}</b> is currently invite-only.
        <br />
        Secure your spot on the waitlist to be among the first
        <br /> to experience it and help shape the future of Garden!
      </Typography>
      <div className="mt-2 flex items-center gap-2">
        <Button className="w-11/12" size="lg" onClick={handleJoinWaitlist}>
          Join the waitlist
        </Button>
        <div
          className="h-full cursor-pointer rounded-2xl bg-dark-grey p-4"
          onClick={handleDisconnect}
        >
          <LogoutIcon className="w-5 cursor-pointer fill-white" />
        </div>
      </div>
    </div>
  );
};

export const WhiteList: FC<WhiteListProps> = ({ open, onClose }) => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { isMobile } = useViewport();

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
      {isMobile ? (
        <BottomSheet open={open}>
          <WhitelistComponent onClose={onClose} />
        </BottomSheet>
      ) : (
        <Modal open={open}>
          <Modal.Children opacityLevel={"medium"} className="rounded-2xl p-6">
            <WhitelistComponent onClose={onClose} />
          </Modal.Children>
        </Modal>
      )}
    </div>
  );
};
