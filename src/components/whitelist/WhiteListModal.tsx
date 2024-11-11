import { Button, LogoutIcon, Modal, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import blossomTestnet from "/blossom-testnet.svg";

type WhiteListModalProps = {
  open: boolean;
  onClose: () => void;
  handleJoinWaitlist: () => void;
  handleDisconnect: () => void;
};

export const WhiteListModal: FC<WhiteListModalProps> = ({
  open,
  handleJoinWaitlist,
  handleDisconnect,
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
        <div className="flex mt-2 gap-2 items-center">
          <Button className="w-11/12" size="lg" onClick={handleJoinWaitlist}>
            Join the waitlist
          </Button>
          <div
            className="h-full bg-dark-grey p-4 rounded-2xl cursor-pointer"
            onClick={handleDisconnect}
          >
            <LogoutIcon className="w-5 cursor-pointer fill-white" />
          </div>
        </div>
      </Modal.Children>
    </Modal>
  );
};
