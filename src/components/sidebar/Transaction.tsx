import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { BTC, ETH } from "../../constants/constants";
import { CreateOrder } from "@gardenfi/orderbook";

const getDayDifference = (date: Date) => {
    const today = new Date();
    const timeDifference = today.getTime() - date.getTime();
    const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    const hourDifference = Math.floor(timeDifference / (1000 * 3600));
    const minuteDifference = Math.floor(timeDifference / (1000 * 60));

    return {
        days: dayDifference,
        hours: hourDifference,
        minutes: minuteDifference,
    };
};

const formatTimeDifference = (updatedAt: string) => {
    const lastEditedData = getDayDifference(new Date(updatedAt));

    if (lastEditedData.days > 3) {
        return "on " + new Date(updatedAt).toLocaleDateString();
    } else if (lastEditedData.days > 0) {
        return `${lastEditedData.days} days ago`;
    } else if (lastEditedData.hours > 0) {
        return `${lastEditedData.hours} hours ago`;
    } else if (lastEditedData.minutes > 0) {
        return `${lastEditedData.minutes} minutes ago`;
    } else {
        return "just now";
    }
};

export const Transaction = ({ order }: { order: CreateOrder }) => {
    return (
        <div className="flex flex-col gap-1">
            <SwapInfo
                sendAsset={order.source_asset === "ETH" ? ETH : BTC}
                receiveAsset={order.destination_asset === "BTC" ? BTC : ETH}
                sendAmount={order.source_amount}
                receiveAmount={order.destination_amount}
            />
            <div className="flex justify-between">
                <Typography size="h5" weight="medium">
                    {order.deleted_at ? "Cancelled" : "Completed"}
                </Typography>
                <Typography size="h5" weight="medium">
                    {formatTimeDifference(order.updated_at)}
                </Typography>
            </div>
        </div>
    );
};
