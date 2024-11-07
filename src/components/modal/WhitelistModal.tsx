import { Button, Modal, Typography } from "@gardenfi/garden-book";
import { FC, useEffect } from "react";
import blossomTestnet from "/blossom-testnet.svg";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";

type WhiteListModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WhiteListModal: FC<WhiteListModalProps> = ({ open }) => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();

  const handleJoinWaitlist = () => {
    window.open("https://waitlist.garden.finance", "_blank");
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
    <Modal open={open}>
      <Modal.Children
        opacityLevel={"medium"}
        className="flex flex-col gap-6 rounded-2xl p-6"
      >
        <img src={blossomTestnet} alt="whitelist" />
        <Typography size="h4">
          <b>Blossom testnet</b> is currently invite-only.
          <br />
          Secure your spot on the waitlist to be among the first
          <br /> to experience it and help shape the future of Garden!
        </Typography>
        <Button className="mt-2" onClick={handleJoinWaitlist}>
          Join the waitlist
        </Button>
      </Modal.Children>
    </Modal>
  );
};
