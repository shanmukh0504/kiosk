import { ArrowRightIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Asset } from "../../constants/constants";

type SwapPreviewProps = {
    sendAsset: Asset;
    receiveAsset: Asset;
    sendAmount: string;
    receiveAmount: string;
};

export const SwapPreview: FC<SwapPreviewProps> = ({
    sendAsset,
    receiveAsset,
    sendAmount,
    receiveAmount,
}) => {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Typography size="h3" weight="medium">
                    {sendAmount}
                </Typography>
                <Typography size="h3" weight="medium">
                    <img src={sendAsset.icon} />
                </Typography>
            </div>
            <ArrowRightIcon />
            <div className="flex items-center gap-2">
                <Typography size="h3" weight="medium">
                    {receiveAmount}
                </Typography>
                <Typography size="h3" weight="medium">
                    <img src={receiveAsset.icon} />
                </Typography>
            </div>
        </div>
    );
};
