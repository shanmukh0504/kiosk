import { ArrowLeftIcon, Button, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { SwapDetails } from "../../constants/constants";
import { SwapPreview } from "./SwapPreview";

type ConfirmSwapProps = {
    swap: SwapDetails;
    goBack: () => void;
};

export const ConfirmSwap: FC<ConfirmSwapProps> = ({ swap, goBack }) => {
    return (
        <div className="flex flex-col gap-4 p-3">
            <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
                <Typography size="h5" weight="bold">
                    Transaction
                </Typography>
                <SwapPreview
                    sendAsset={swap.sendAsset}
                    receiveAsset={swap.receiveAsset}
                    sendAmount={swap.sendAmount}
                    receiveAmount={swap.receiveAmount}
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-grow">
                    <Button variant="disabled" size="lg">Awaiting Deposit</Button>
                </div>
                <div
                    className="flex items-center bg-dark-grey rounded-2xl p-3 cursor-pointer"
                    onClick={goBack}
                >
                    <ArrowLeftIcon className="w-6 h-[14px]" />
                </div>
            </div>
        </div>
    );
};
