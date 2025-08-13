import {
  ArrowRightIcon,
  TokenNetworkLogos,
  Typography,
} from "@gardenfi/garden-book";
import { Asset } from "@gardenfi/orderbook";
import { FC } from "react";
import { assetInfoStore } from "../store/assetInfoStore";

type SwapInfoProps = {
  sendAsset: Asset;
  receiveAsset: Asset;
  sendAmount: string | number;
  receiveAmount: string | number;
  equalSplit?: boolean;
};

export const SwapInfo: FC<SwapInfoProps> = ({
  sendAsset,
  receiveAsset,
  sendAmount,
  receiveAmount,
  equalSplit = false,
}) => {
  const { allChains } = assetInfoStore();
  const sendChain = allChains ? allChains[sendAsset.chain] : undefined;
  const receiveChain = allChains ? allChains[receiveAsset.chain] : undefined;

  return (
    <div className="flex items-center justify-between">
      <div
        className={`flex items-center justify-start gap-2 ${equalSplit ? "w-fit" : "w-full"}`}
      >
        <Typography size="h3" weight="regular">
          {sendAmount}
        </Typography>
        <TokenNetworkLogos
          tokenLogo={sendAsset.logo}
          chainLogo={
            sendChain?.networkLogo === sendAsset.logo
              ? ""
              : sendChain?.networkLogo
          }
        />
      </div>
      <ArrowRightIcon className={equalSplit ? "" : "h-5 w-9"} />
      <div
        className={`flex items-center justify-end gap-2 ${equalSplit ? "w-fit" : "w-full"}`}
      >
        <Typography size="h3" weight="regular">
          {receiveAmount}
        </Typography>
        <TokenNetworkLogos
          tokenLogo={receiveAsset.logo}
          chainLogo={receiveChain?.networkLogo}
        />
      </div>
    </div>
  );
};
