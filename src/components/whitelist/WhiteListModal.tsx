import { Button, Modal, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import blossomTestnet from "/blossom-testnet.svg";

type WhiteListModalProps = {
  open: boolean;
  onClose: () => void;
  handleJoinWaitlist: () => void;
};

export const WhiteListModal: FC<WhiteListModalProps> = ({
  open,
  handleJoinWaitlist,
}) => {
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
        <Button className="mt-2" size="lg" onClick={handleJoinWaitlist}>
          Join the waitlist
        </Button>
      </Modal.Children>
    </Modal>
  );
};
