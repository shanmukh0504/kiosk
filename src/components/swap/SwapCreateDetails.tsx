import { FC, useMemo } from "react";
// import { SwapFeesComparison } from "./SwapFeesComparison";
import { Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import AddressDetails from "../../common/AddressDetails";
import { ScaleYIn } from "../../common/ScaleY";
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

  let refundAddress = null;
  let receiveAddress = null;

  if (inputAsset && isBitcoin(inputAsset.chain)) {
    refundAddress = btcAddress;
    receiveAddress = address;
  } else if (outputAsset && isBitcoin(outputAsset.chain)) {
    receiveAddress = btcAddress;
    refundAddress = address;
  } else {
    refundAddress = address;
    receiveAddress = address;
  }

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );
  // const [triggerFeesAnimation, setTriggerFeesAnimation] = useState(false);

  // useEffect(() => {
  //   if (fees) {
  //     setTriggerFeesAnimation(false);
  //     setTimeout(() => setTriggerFeesAnimation(true), 0);
  //   }
  // }, [fees]);

  return (
    <>
      <div
        className="flex flex-col gap-3
        bg-white/50 rounded-2xl
        pt-4 pb-3 px-4 mb-4"
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div>
          <div className="flex justify-between items-center pb-0.5">
            <Typography size="h5" weight="medium">
              Slippage
            </Typography>
            <Typography size="h4" weight="medium">
              1%
            </Typography>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <ScaleYIn triggerAnimation={false}>
              <Typography size="h4" weight="medium">
                {fees ? "$" + Number(fees.toFixed(4)) : "--"}
              </Typography>
            </ScaleYIn>
          </div>
          {receiveAddress && <AddressDetails address={receiveAddress} />}
          {refundAddress && <AddressDetails address={refundAddress} isRefund />}
        </div>
      </div>
    </>
  );
};
