import { ArrowLeftIcon, Button, CheckIcon, CopyIcon, Typography } from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { SwapDetails } from "../../constants/constants";
import { SwapPreview } from "./SwapPreview";

type ConfirmSwapProps = {
    swap: SwapDetails;
    goBack: () => void;
};

export const ConfirmSwap: FC<ConfirmSwapProps> = ({ swap, goBack }) => {
    const [copied, setCopied] = useState(false);
    const isRecoveryAddress = swap.sendAsset.ticker === "BTC";
    const depositAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

    const truncateAddress = (address: string): string => {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4, address.length);
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(depositAddress);

        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1500);
    }

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
            <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
                <Typography size="h5" weight="bold">
                    Deposit address
                </Typography>
                <div className="flex justify-between items-center">
                    <Typography size="h3" weight="bold">
                        {truncateAddress(depositAddress)}
                    </Typography>
                    {/* TODO: Use a Lottie animation to make this smoother */}
                    {copied ?
                        <CheckIcon className="w-6 h-3" />
                        :
                        <CopyIcon
                            className="w-6 h-5 cursor-pointer"
                            onClick={copyToClipboard}
                        />
                    }
                </div>
            </div>
            <div className="flex flex-col gap-3 bg-white/50 rounded-2xl p-4">
                <Typography size="h5" weight="bold">
                    Transaction details
                </Typography>
                <div className="flex justify-between">
                    <Typography size="h4" weight="medium">
                        Fees
                    </Typography>
                    <div className="flex gap-5">
                        <Typography size="h4" weight="medium">
                            0.00101204 BTC
                        </Typography>
                        <Typography size="h4" weight="medium">
                            $56.56
                        </Typography>
                    </div>
                </div>
                <div className="flex justify-between">
                    <Typography size="h4" weight="medium">
                        {isRecoveryAddress ? "Recovery" : "Receive"} address
                    </Typography>
                    <Typography size="h4" weight="medium">
                        {truncateAddress(swap.address)}
                    </Typography>
                </div>
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
