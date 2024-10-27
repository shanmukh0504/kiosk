import { ArrowRightIcon, Typography } from "@gardenfi/garden-book";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { FC } from "react";
import { assetInfoStore } from "../store/assetInfoStore";
import BigNumber from "bignumber.js";

const formatAmount = (
  amount: string | number,
  decimals: number,
  toFixed = 4,
) => {
  const bigAmount = new BigNumber(amount);
  return bigAmount.dividedBy(10 ** decimals).toFixed(toFixed);
};

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
  const { chains } = assetInfoStore();
  const sendChain =
    chains && !isBitcoin(sendAsset.chain) ? chains[sendAsset.chain] : undefined;
  const receiveChain =
    chains && !isBitcoin(receiveAsset.chain)
      ? chains[receiveAsset.chain]
      : undefined;

  return (
    <div className="flex justify-between items-center">
      <div className="flex grow basis-0 items-center gap-2">
        <Typography size="h3" weight="medium">
          {formatAmount(sendAmount, sendAsset.decimals)}
        </Typography>
        <img src={sendAsset.logo} className="w-5" />
        {sendChain ? <img src={sendChain.networkLogo} className="w-5" /> : null}
      </div>
      <ArrowRightIcon />
      <div className="flex grow basis-0 justify-end items-center gap-2">
        <Typography size="h3" weight="medium">
          {formatAmount(receiveAmount, receiveAsset.decimals)}
        </Typography>
        <img src={receiveAsset.logo} className="w-5" />
        {receiveChain ? (
          <img src={receiveChain.networkLogo} className="w-5" />
        ) : null}
      </div>
    </div>
  );
};
