import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { BTC } from "../../constants/constants";

export const Transaction = () => {
    return (
        <div className="flex flex-col gap-1">
            <SwapInfo
                sendAsset={BTC}
                receiveAsset={BTC}
                sendAmount="0.06212967"
                receiveAmount="0.06212967"
            />
            <div className="flex justify-between">
                <Typography size="h5" weight="medium">
                    Completed
                </Typography>
                <Typography size="h5" weight="medium">
                    4 min ago
                </Typography>
            </div>
        </div>
    );
};
