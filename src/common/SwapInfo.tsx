import { ArrowRightIcon, Typography } from "@gardenfi/garden-book";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { FC } from "react";
import { assetInfoStore } from "../store/assetInfoStore";
import { AssetChainLogos } from "./AssetChainLogos";

type SwapInfoProps = {
  sendAsset: Asset;
  receiveAsset: Asset;
  sendAmount: string | number;
  receiveAmount: string | number;
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
    <div className="flex items-center justify-between">
      <div className="flex w-fit items-center gap-2">
        <Typography size="h3" weight="medium">
          {sendAmount}
        </Typography>
        <AssetChainLogos
          tokenLogo={sendAsset.logo}
          chainLogo={sendChain?.networkLogo}
        />
      </div>
      <ArrowRightIcon className="w-fit" />
      <div className="flex w-fit items-center justify-end gap-2">
        <Typography size="h3" weight="medium">
          {receiveAmount}
        </Typography>
        <AssetChainLogos
          tokenLogo={receiveAsset.logo}
          chainLogo={receiveChain?.networkLogo}
        />
      </div>
    </div>
  );
};
