import { useState, FC, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { SwapComparison } from "./SwapComparison";
import { AddressDetails } from "./AddressDetails";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useSwap } from "../../hooks/useSwap";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion, AnimatePresence } from "framer-motion";

type SwapDetailsProps = {
  tokenPrices: TokenPrices;
  isExpanded: boolean;
};

export const SwapDetails: FC<SwapDetailsProps> = ({
  tokenPrices,
  isExpanded,
}) => {
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);

  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { inputAsset, outputAsset } = useSwap();

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const refundAddress = useMemo(
    () => (inputAsset && isBitcoin(inputAsset.chain) ? btcAddress : address),
    [inputAsset, btcAddress, address]
  );

  const receiveAddress = useMemo(
    () => (outputAsset && isBitcoin(outputAsset.chain) ? btcAddress : address),
    [outputAsset, btcAddress, address]
  );

  const handleShowComparison = (type: "time" | "fees") => {
    setIsShowComparison({
      isOpen: true,
      isTime: type === "time",
      isFees: type === "fees",
    });
  };

  return (
    <>
      <SwapComparison
        visible={showComparison.isOpen}
        hide={() =>
          setIsShowComparison({ isOpen: false, isTime: false, isFees: false })
        }
        isTime={showComparison.isTime}
        isFees={showComparison.isFees}
        onComparisonUpdate={(time, cost) => {
          setMaxTimeSaved(time);
          setMaxCostSaved(cost);
        }}
      />
      <div className="flex flex-col gap-2 rounded-2xl bg-white/50 pb-3 pt-4">
        <Typography size="h5" weight="bold" className="px-4">
          Details
        </Typography>
        <div>
          <AnimatePresence>
            {maxTimeSaved > 0 && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, transformOrigin: "top" }}
                animate={{ opacity: 1, height: "auto", transformOrigin: "top" }}
                exit={{ opacity: 0, height: 0, transformOrigin: "top" }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  mass: 0.8,
                }}
                className="overflow-hidden"
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-0 px-4 hover:bg-white"
                  onClick={() => handleShowComparison("time")}
                >
                  <Typography size="h5" weight="medium">
                    Time saved
                  </Typography>
                  <div className="flex gap-5 py-1">
                    <Typography size="h4" weight="medium">
                      {`${Math.floor(maxTimeSaved / 60)}m ${maxTimeSaved % 60}s`}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {maxCostSaved > 0 && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, transformOrigin: "top" }}
                animate={{ opacity: 1, height: "auto", transformOrigin: "top" }}
                exit={{ opacity: 0, height: 0, transformOrigin: "top" }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  mass: 0.8,
                }}
                className="overflow-hidden"
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-0 px-4 hover:bg-white"
                  onClick={() => handleShowComparison("fees")}
                >
                  <Typography size="h5" weight="medium">
                    Cost saved
                  </Typography>
                  <div className="flex gap-5 py-1">
                    <Typography size="h4" weight="medium">
                      {`$${maxCostSaved.toFixed(2)}`}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-0 px-4">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {fees ? "$" + Number(fees.toFixed(4)) : ""}
              </Typography>
            </div>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-1 px-4">
            {receiveAddress && <AddressDetails address={receiveAddress} />}
            {refundAddress && (
              <AddressDetails address={refundAddress} isRefund />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
