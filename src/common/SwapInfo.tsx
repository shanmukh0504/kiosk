import { ArrowRightIcon, Typography } from "@gardenfi/garden-book";
import { Asset } from "@gardenfi/orderbook";
import { FC } from "react";

type SwapInfoProps = {
  sendAsset: Asset;
  receiveAsset: Asset;
  sendAmount: string;
  receiveAmount: string;
};

export const SwapInfo: FC<SwapInfoProps> = ({
  sendAsset,
  receiveAsset,
  sendAmount,
  receiveAmount,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex grow basis-0 items-center gap-2">
        <Typography size="h3" weight="medium">
          {sendAmount}
        </Typography>
        <Typography size="h3" weight="medium">
          <img src={sendAsset.logo} className="w-5" />
        </Typography>
      </div>
      <ArrowRightIcon />
      <div className="flex grow basis-0 justify-end items-center gap-2">
        <Typography size="h3" weight="medium">
          {receiveAmount}
        </Typography>
        <Typography size="h3" weight="medium">
          <img src={receiveAsset.logo} className="w-5" />
        </Typography>
      </div>
    </div>
  );
};
