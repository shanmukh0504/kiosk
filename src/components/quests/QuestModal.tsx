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
      <div className="flex flex-col gap-6 bg-white/50 backdrop-blur-[20px] rounded-2xl w-[600px] p-6">
        <div className="flex justify-between items-center">
          <PartnerChip name={partner} logo={logo} />
          <CloseIcon
            className="w-6 h-[14px] cursor-pointer"
            onClick={onClose}
          />
        </div>
        <Typography size="h3" weight="medium">
          {description}
        </Typography>
        <div className="flex flex-col gap-5">
          <Typography size="h4" weight="bold">
            Explore our socials
          </Typography>
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <TrustWallet className="w-9 h-9" />
              <div className="flex flex-col">
                <Typography size="h4" weight="bold">
                  Follow @garden_finance
                </Typography>
                <Typography size="h5" weight="medium">
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
