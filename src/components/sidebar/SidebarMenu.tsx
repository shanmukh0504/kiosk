import { FC } from "react";
import {
  AddIcon,
  // LanguageIcon,
  // ReferralIcon,
  LogoutIcon,
  Typography,
} from "@gardenfi/garden-book";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useId } from "react";
import { Tooltip } from "../../common/Tooltip";
import { useEVMWallet } from "../../hooks/useEVMWallet";

type SideBarMenuProps = {
  onClose: () => void;
};

export const SidebarMenu: FC<SideBarMenuProps> = ({ onClose }) => {
  const { address, disconnect } = useEVMWallet();
  const addTooltipId = useId();
  const languageTooltipId = useId();
  const referralTooltipId = useId();
  const logoutTooltipId = useId();

  const handleDisconnectClick = () => {
    disconnect();
    onClose();
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex gap-3">
          {address && (
            <div className="bg-white/50 rounded-full px-3 py-1">
              <Typography size="h3" weight="medium">
                {getTrimmedAddress(address)}
              </Typography>
            </div>
          )}
          <div
            data-tooltip-id={addTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <AddIcon className="w-5 h-3" />
          </div>
        </div>
        <div className="flex gap-3">
          {/* <div
            data-tooltip-id={languageTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <LanguageIcon className="w-5 h-4" />
          </div>
          <div
            data-tooltip-id={referralTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <ReferralIcon className="w-5 h-4" />
          </div> */}
          <div
            data-tooltip-id={logoutTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <LogoutIcon
              className="w-5 h-4 cursor-pointer"
              onClick={handleDisconnectClick}
            />
            {/* TODO: These tooltips are temporarily placed within this `div` as they
                        are causing styling issues placed elsewhere. They should be moved once
                        the `garden` wrapper classes are removed. */}
            <Tooltip id={addTooltipId} place="top" content="Wallet" />
            <Tooltip id={languageTooltipId} place="top" content="Language" />
            <Tooltip id={referralTooltipId} place="top" content="Referrals" />
            <Tooltip id={logoutTooltipId} place="top" content="Logout" />
          </div>
        </div>
      </div>
    </>
  );
};
