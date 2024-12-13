import { KeyboardDownIcon, Typography } from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { getTrimmedAddress } from "../../../utils/getTrimmedAddress";
import { Asset } from "@gardenfi/orderbook";

type OrderDetailsProps = {
  fees: string;
  filledAmount: number;
  amountToFill: number;
  btcAddress?: string;
  inputAsset: Asset | null;
};

export const OrderDetails: FC<OrderDetailsProps> = ({
  fees,
  filledAmount,
  amountToFill,
  btcAddress,
  inputAsset,
}) => {
  const [dropdown, setDropdown] = useState(false);

  const handleDropdown = () => {
    setDropdown(!dropdown);
  };

  return (
    <div className="flex flex-col justify-between bg-white/50 rounded-2xl p-4">
      <div
        onClick={handleDropdown}
        className="flex w-full justify-between items-center cursor-pointer"
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div
          className={`transform transition-transform duration-300 ${
            dropdown ? "rotate-180" : "rotate-0"
          }`}
        >
          <KeyboardDownIcon />
        </div>
      </div>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          dropdown ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 rounded-2xl mt-2">
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
              {filledAmount} / {amountToFill} {inputAsset?.symbol}
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
      </div>
    </div>
  );
};
