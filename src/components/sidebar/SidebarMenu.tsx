import { AddIcon, LanguageIcon, LogoutIcon, ReferralIcon, Typography } from "@gardenfi/garden-book";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useId } from "react";
import { Tooltip } from "../../common/Tooltip";

export const SidebarMenu = () => {
    const addTooltipId = useId();
    const languageTooltipId = useId();
    const referralTooltipId = useId();
    const logoutTooltipId = useId();
    const address = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";

    return (
        <>
            <div className="flex justify-between">
                <div className="flex gap-3">
                    <div className="bg-white/50 rounded-full px-3 py-1">
                        <Typography size="h3" weight="medium">
                            {getTrimmedAddress(address)}
                        </Typography>
                    </div>
                    <div
                        data-tooltip-id={addTooltipId}
                        className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
                    >
                        <AddIcon className="w-5 h-3" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div
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
                    </div>
                    <div
                        data-tooltip-id={logoutTooltipId}
                        className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
                    >
                        <LogoutIcon className="w-5 h-4" />
                    </div>
                </div>
                <Tooltip
                    id={addTooltipId}
                    place="top"
                    content="Wallet"
                />
                <Tooltip
                    id={languageTooltipId}
                    place="top"
                    content="Language"
                />
                <Tooltip
                    id={referralTooltipId}
                    place="top"
                    content="Referrals"
                />
                <Tooltip
                    id={logoutTooltipId}
                    place="top"
                    content="Logout"
                />
            </div>
        </>
    );
};
