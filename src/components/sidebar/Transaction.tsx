import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { BTC } from "../../constants/constants";

export const Transaction = () => {
    return (
        <div className="">
            <SwapInfo
                sendAsset={BTC}
                receiveAsset={BTC}
                sendAmount="0.06212967"
                receiveAmount="0.06212967"
            />
        </div>
    );
};
