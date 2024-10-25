import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import BigNumber from "bignumber.js";
import { assetInfoStore, AssetsData } from "../../store/assetInfoStore";
import { useEffect } from "react";

const formatAmount = (amount: string | number) => {
    const bigAmount = new BigNumber(amount);
    return bigAmount.isGreaterThan(1e10)
        ? bigAmount.toExponential(2)
        : bigAmount.toString();
};

const getDayDifference = (date: Date) => {
    const now = new Date();
    const differenceInMs = now.getTime() - new Date(date).getTime();
    const dayDifference = Math.floor(differenceInMs / (1000 * 3600 * 24));
    const hourDifference = Math.floor(differenceInMs / (1000 * 3600));
    const minuteDifference = Math.floor(differenceInMs / (1000 * 60));

    if (dayDifference > 3) return `on ${new Date(date).toLocaleDateString()}`;
    if (dayDifference > 0) return `${dayDifference} day${dayDifference > 1 ? "s" : ""} ago`;
    if (hourDifference > 0) return `${hourDifference} hour${hourDifference > 1 ? "s" : ""} ago`;
    if (minuteDifference > 0) return `${minuteDifference} minute${minuteDifference > 1 ? "s" : ""} ago`;
    return "just now";
};

export const Transaction = ({ order }: { order: any }) => {
    const { create_order } = order;
    const { assetsData, fetchAssetsData } = assetInfoStore();

    useEffect(() => {
        if (!assetsData) fetchAssetsData();
    }, [assetsData, fetchAssetsData]);

    if (!assetsData) return null;

    const { source_chain: sourceChain, destination_chain: destinationChain } = create_order;

    if (!assetsData[sourceChain as keyof AssetsData] || !assetsData[destinationChain as keyof AssetsData]) return null;

    return (
        <div className="flex flex-col gap-1 pb-4">
            <SwapInfo
                sendChain={assetsData[sourceChain as keyof AssetsData]}
                receiveChain={assetsData[destinationChain as keyof AssetsData]}
                sendAmount={formatAmount(create_order.source_amount)}
                receiveAmount={formatAmount(create_order.destination_amount)}
            />
            <div className="flex justify-between">
                <Typography size="h5" weight="medium">
                    {create_order.deleted_at ? "Cancelled" : "Completed"}
                </Typography>
                <Typography size="h5" weight="medium">
                    {getDayDifference(create_order.updated_at)}
                </Typography>
            </div>
        </div>
    );
};
