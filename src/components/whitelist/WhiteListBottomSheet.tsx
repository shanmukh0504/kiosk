import { FC } from "react";
import { BottomSheet } from "../../common/BottomSheet";
import blossomTestnet from "/blossom-testnet-mobile.svg";
import { Modal, Typography, Button, LogoutIcon } from "@gardenfi/garden-book";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  handleJoinWaitlist: () => void;
  handleDisconnect: () => void;
};

export const WhiteListBottomSheet: FC<BottomSheetProps> = ({
  open,
  handleJoinWaitlist,
  handleDisconnect,
}) => {
  return (
    <div
      className={`bg-dark-grey
      absolute z-40
      h-full w-full
      transition-colors ease-cubic-in-out duration-500
      ${open ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}
    >
      <Modal open={open}>
        <Modal.Children opacityLevel={"medium"}>
          <BottomSheet open={open}>
            <div className="flex flex-col gap-5 rounded-2xl p-1 mt-2">
              <img src={blossomTestnet} alt="whitelist" />
              <Typography size="h4" className="pt-1">
                <b>Blossom testnet</b> is currently invite-only.
                <br />
                Secure your spot on the waitlist to be among the first to
                experience it and help shape the future of Garden!
              </Typography>
            </div>
            <div className="flex mt-2 gap-2 items-center">
              <Button
                className="w-11/12"
                size="lg"
                onClick={handleJoinWaitlist}
              >
                Join the waitlist
              </Button>
              <div
                className="h-full bg-dark-grey p-4 rounded-2xl cursor-pointer"
                onClick={handleDisconnect}
              >
                <LogoutIcon className="w-5 cursor-pointer fill-white" />
              </div>
            </div>
          </BottomSheet>
        </Modal.Children>
      </Modal>
    </div>
  );
};
