import {
  Button,
  CloseIcon,
  Modal,
  TrustWallet,
  Typography,
} from "@gardenfi/garden-book";
import React, { useId } from "react";
import { PartnerChip } from "./PartnerChip";
import { Tooltip } from "../../common/Tooltip";

type QuestModalProps = {
  partner: string;
  description: string;
  logo: React.ReactNode;
  open: boolean;
  onClose: () => void;
};

export const QuestModal: React.FC<QuestModalProps> = ({
  partner,
  description,
  logo,
  open,
  onClose,
}) => {
  const tooltipId = useId();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex w-[600px] flex-col gap-6 rounded-2xl bg-white/50 p-6 backdrop-blur-[20px]">
        <div className="flex items-center justify-between">
          <PartnerChip name={partner} logo={logo} />
          <CloseIcon
            data-testid="close-icon"
            className="h-[14px] w-6 cursor-pointer"
            onClick={onClose}
          />
        </div>
        <Typography size="h3" weight="regular">
          {description}
        </Typography>
        <div className="flex flex-col gap-5">
          <Typography size="h4" weight="medium">
            Explore our socials
          </Typography>
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <TrustWallet className="h-9 w-9" />
              <div className="flex flex-col">
                <Typography size="h4" weight="medium">
                  Follow @garden_finance
                </Typography>
                <Typography size="h5" weight="regular">
                  Follow our 𝕏 account
                </Typography>
              </div>
            </div>
            <Button>Follow</Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Tooltip
            id={tooltipId}
            place="top"
            content="Complete the above tasks to claim."
          />
          <Button variant="disabled" data-tooltip-id={tooltipId}>
            Claim Rewards
          </Button>
        </div>
      </div>
    </Modal>
  );
};
