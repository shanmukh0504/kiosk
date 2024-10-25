import { ArrowRightIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { ChainData } from "../store/assetInfoStore";

type SwapInfoProps = {
  sendChain: ChainData;
  receiveChain: ChainData;
  sendAmount: string;
  receiveAmount: string;
};

export const SwapInfo: FC<SwapInfoProps> = ({
  sendChain,
  receiveChain,
  sendAmount,
  receiveAmount,
}) => {
  const { assetConfig: sendAssetConfig, networkLogo: sendNetworkLogo } = sendChain;
  const { assetConfig: receiveAssetConfig, networkLogo: receiveNetworkLogo } = receiveChain;

  const sendAsset = sendAssetConfig[0];
  const receiveAsset = receiveAssetConfig[0];

  return (
    <div className="flex justify-between items-center">
      <div className="flex grow basis-0 items-center gap-2">
        <Typography size="h3" weight="medium">{sendAmount}</Typography>
        {sendAsset.name !== "Bitcoin" && (
          <img src={sendAsset.logo} alt={`${sendAsset.name} logo`} className="w-5" />
        )}
        <img src={sendNetworkLogo} alt={`${sendChain.name} network logo`} className="w-5" />
      </div>
      <ArrowRightIcon />
      <div className="flex grow basis-0 justify-end items-center gap-2">
        <Typography size="h3" weight="medium">{receiveAmount}</Typography>
        {receiveAsset.name !== "Bitcoin" && (
          <img src={receiveAsset.logo} alt={`${receiveAsset.name} logo`} className="w-5" />
        )}
        <img src={receiveNetworkLogo} alt={`${receiveChain.name} network logo`} className="w-5" />
      </div>
    </div>
  );
};
