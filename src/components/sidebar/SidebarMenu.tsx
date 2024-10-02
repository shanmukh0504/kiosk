import { AddIcon, LanguageIcon, LogoutIcon, ReferralIcon, Typography } from "@gardenfi/garden-book";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";

export const SidebarMenu = () => {
    const address = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";
    return (
        <div className="flex justify-between">
            <div className="flex gap-3">
                <div className="bg-white/50 rounded-full px-3 py-1">
                    <Typography size="h3" weight="medium">
                        {getTrimmedAddress(address)}
                    </Typography>
                </div>
                <div className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer">
                    <AddIcon className="w-5 h-3" />
                </div>
            </div>
            <div className="flex gap-3">
                <div className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer">
                    <LanguageIcon className="w-5 h-4" />
                </div>
                <div className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer">
                    <ReferralIcon className="w-5 h-4" />
                </div>
                <div className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer">
                    <LogoutIcon className="w-5 h-4" />
                </div>
            </div>
        </div>
    );
};
