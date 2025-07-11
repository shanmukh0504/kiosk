import { useState, useMemo } from "react";
import {
  KeyboardDownIcon,
  SwapHorizontalIcon,
  Typography,
} from "@gardenfi/garden-book";
import { BTC, swapStore } from "../../store/swapStore";
import { CompetitorComparisons } from "./CompetitorComparisons";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { isBitcoin, isSolana } from "@gardenfi/orderbook";
import { motion, AnimatePresence } from "framer-motion";
import { getProtocolFee } from "../../utils/utils";
import { getBitcoinNetwork } from "../../constants/constants";
import { useNetworkFees } from "../../hooks/useNetworkFees";
import {
  fadeAnimation,
  delayedFadeAnimation,
} from "../../animations/animations";
import { SwapSavingsAndAddresses } from "./SwapSavingsAndAddresses";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";

export const FeesAndRateDetails = () => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showComparison, setIsShowComparison] = useState({
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);

  const { tokenPrices, inputAsset, outputAsset, rate, setIsComparisonVisible } =
    swapStore();
  const network = getBitcoinNetwork();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { address } = useEVMWallet();
  const { networkFeesValue } = useNetworkFees(network, inputAsset);

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const protocolFee = useMemo(() => getProtocolFee(fees), [fees]);

  const isBitcoinChains = outputAsset?.symbol.includes(BTC.symbol);
  const formattedRate = useMemo(
    () => Number(rate.toFixed(isBitcoinChains ? 7 : 3)),
    [isBitcoinChains, rate]
  );

  const refundAddress = useMemo(
    () =>
      inputAsset
        ? isBitcoin(inputAsset.chain)
          ? btcAddress
          : isSolana(inputAsset.chain)
            ? solanaAddress
            : address
        : undefined,
    [inputAsset, btcAddress, solanaAddress, address]
  );

  const receiveAddress = useMemo(
    () =>
      outputAsset
        ? isBitcoin(outputAsset.chain)
          ? btcAddress
          : isSolana(outputAsset.chain)
            ? solanaAddress
            : address
        : undefined,
    [outputAsset, btcAddress, solanaAddress, address]
  );

  const handleShowComparison = (type: "time" | "fees") => {
    setIsComparisonVisible(true);
    setIsShowComparison({
      isTime: type === "time",
      isFees: type === "fees",
    });
  };

  const handleComparisonUpdate = (time: number, cost: number) => {
    setMaxTimeSaved(time);
    setMaxCostSaved(cost);
  };

  const handleHideComparison = () => {
    setIsComparisonVisible(false);
    setIsShowComparison({
      isTime: false,
      isFees: false,
    });
  };

  return (
    <>
      <CompetitorComparisons
        hide={handleHideComparison}
        isTime={showComparison.isTime}
        isFees={showComparison.isFees}
        onComparisonUpdate={handleComparisonUpdate}
      />
      <div className="flex flex-col rounded-2xl bg-white/50 pb-4 transition-all duration-200">
        <div className="flex w-full items-center justify-between rounded-2xl px-4 pt-4">
          <div className="relative flex w-full items-center justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key="label-rate"
                {...fadeAnimation}
                className="absolute left-0 flex items-center justify-start gap-1"
              >
                <Typography
                  size="h5"
                  weight="medium"
                  className="!text-mid-grey"
                >
                  1 {inputAsset?.symbol}
                </Typography>
                <SwapHorizontalIcon className="h-3 w-3" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex w-full items-center justify-end gap-1">
            <AnimatePresence mode="wait">
              <motion.div
                key="value-rate"
                {...delayedFadeAnimation}
                className="flex items-center gap-1"
              >
                <Typography size="h5" weight="medium">
                  {formattedRate} {outputAsset?.symbol}
                </Typography>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {
                <motion.div
                  initial={{ width: 0, scale: 0, opacity: 0 }}
                  animate={{ width: "auto", scale: 1, opacity: 1 }}
                  exit={{ width: 0, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <KeyboardDownIcon
                    className={`h-4 w-4 cursor-pointer px-1 transition-transform duration-300 ${
                      isDetailsExpanded ? "rotate-180" : ""
                    }`}
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  />
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence>
          {isDetailsExpanded && (
            <SwapSavingsAndAddresses
              timeSaved={maxTimeSaved}
              costSaved={maxCostSaved}
              refundAddress={refundAddress}
              receiveAddress={receiveAddress}
              showComparison={handleShowComparison}
              protocolFee={protocolFee}
              networkFeesValue={networkFeesValue}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
