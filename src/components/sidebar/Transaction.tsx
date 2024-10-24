import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { BTC, ETH } from "../../constants/constants";
import BigNumber from "bignumber.js";

const formatAmount = (amount: string | number) => {
    const bigAmount = new BigNumber(amount);
    
    if (bigAmount.isGreaterThan(1e10)) {
        return bigAmount.toExponential(2);
    }
    
    return bigAmount.toString();
};

const getDayDifference = (date: Date) => {
    date = new Date(date);
    const today = new Date();
    const timeDifference = today.getTime() - date.getTime();
    const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    const hourDifference = Math.floor(timeDifference / (1000 * 3600));
    const minuteDifference = Math.floor(timeDifference / (1000 * 60));

    if (dayDifference > 3) {
        return "on " + new Date(date).toLocaleDateString();
    } else if (dayDifference > 0) {
        if (dayDifference === 1) return "1 day ago";
        return `${dayDifference} days ago`;
    } else if (hourDifference > 0) {
        if (hourDifference === 1) return `1 hour ago`;
        return `${hourDifference} hours ago`;
    } else if (minuteDifference > 0) {
        if (minuteDifference === 1) return `1 minute ago`;
        return `${minuteDifference} minutes ago`;
    } else {
        return "just now";
    }
};

export const Transaction = ({ order }: { order: any }) => {
    const { create_order } = order;

    return (
        <div className="flex flex-col gap-1 pb-4">
            <SwapInfo
                sendAsset={create_order.source_chain === "primary" || create_order.source_chain === "bitcoin_testnet" ? BTC : ETH}
                receiveAsset={create_order.destination_chain === "primary" || create_order.destination_chain === "bitcoin_testnet" ? BTC : ETH}
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
