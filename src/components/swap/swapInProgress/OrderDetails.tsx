import {
  KeyboardDownIcon,
  KeyboardUpIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { getTrimmedAddress } from "../../../utils/getTrimmedAddress";
import { Asset } from "@gardenfi/orderbook";

type OrderDetailsProps = {
  fees: string;
  filledAmount: number;
  amountToFill: number;
  btcAddress?: string;
  outputAsset: Asset | null;
};

export const OrderDetails: FC<OrderDetailsProps> = ({
  fees,
  filledAmount,
  amountToFill,
  btcAddress,
  outputAsset,
}) => {
  const [dropdown, setDropdown] = useState(false);

  const handleDropdown = () => {
    setDropdown(!dropdown);
  };

  return (
    <div className="flex flex-col gap-2 justify-between bg-white/50 rounded-2xl p-4">
      <div
        onClick={handleDropdown}
        className="flex w-full justify-between items-center cursor-pointer"
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        {dropdown ? <KeyboardUpIcon /> : <KeyboardDownIcon />}
      </div>
      {dropdown && (
        <div className="flex flex-col gap-3 rounded-2xl">
          <div className="flex justify-between">
            <Typography size="h4" weight="medium">
              Fees
            </Typography>
            <div className="flex gap-5">
              <Typography size="h4" weight="medium">
                ${fees}
              </Typography>
            </div>
          </div>
          <div className="flex justify-between">
            <Typography size="h4" weight="medium">
              Amount
            </Typography>
            <Typography size="h4" weight="medium">
              {filledAmount} / {amountToFill} {outputAsset?.symbol}
            </Typography>
          </div>
          {btcAddress && (
            <div className="flex justify-between">
              <Typography size="h4" weight="medium">
                Recovery address
              </Typography>
              <Typography size="h4" weight="medium">
                {getTrimmedAddress(btcAddress)}
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
