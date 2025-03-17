import { FC, useMemo } from "react";
// import { SwapFeesComparison } from "./SwapFeesComparison";
import { ScaleY, Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import { AddressDetails } from "./AddressDetails";

import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useSwap } from "../../hooks/useSwap";

type SwapCreateDetailsProps = {
  tokenPrices: TokenPrices;
};

export const SwapCreateDetails: FC<SwapCreateDetailsProps> = ({
  tokenPrices,
}) => {
  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { inputAsset, outputAsset } = useSwap();

  const refundAddress =
    inputAsset && isBitcoin(inputAsset.chain) ? btcAddress : address;
  const receiveAddress =
    outputAsset && isBitcoin(outputAsset.chain) ? btcAddress : address;

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const slippage =
    inputAsset?.name.toLowerCase().includes("bitcoin") &&
    outputAsset?.name.toLowerCase().includes("bitcoin")
      ? "0%"
      : "1%";

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl bg-white/50 px-4 pb-3 pt-4">
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div>
          <div className="flex items-center justify-between pb-0.5">
            <Typography size="h5" weight="medium">
              Slippage
            </Typography>
            <Typography size="h4" weight="medium">
              {slippage}
            </Typography>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <ScaleY triggerAnimation={false}>
              <Typography size="h4" weight="medium">
                {fees ? "$" + Number(fees.toFixed(4)) : "--"}
              </Typography>
            </ScaleY>
          </div>
          {receiveAddress && <AddressDetails address={receiveAddress} />}
          {refundAddress && <AddressDetails address={refundAddress} isRefund />}
        </div>
      </div>
    </>
  );
};
