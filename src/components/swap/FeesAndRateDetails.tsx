import { useState, useMemo, useRef } from "react";
import { InfoIcon, KeyboardDownIcon, Typography } from "@gardenfi/garden-book";
import { BTC, swapStore } from "../../store/swapStore";
import { CompetitorComparisons } from "./CompetitorComparisons";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion, AnimatePresence } from "framer-motion";
import { formatAmount, getProtocolFee } from "../../utils/utils";
import { getBitcoinNetwork } from "../../constants/constants";
import { useNetworkFees } from "../../hooks/useNetworkFees";
import {
  fadeAnimation,
  delayedFadeAnimation,
} from "../../animations/animations";
import { TooltipWrapper } from "../../common/ToolTipWrapper";
import { CostToolTip } from "./CostToolTip";
import { SwapSavingsAndAddresses } from "./SwapSavingsAndAddresses";

export const FeesAndRateDetails = () => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showComparison, setIsShowComparison] = useState({
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);
  const targetRef = useRef<HTMLDivElement>(null);

  const { tokenPrices, inputAsset, outputAsset, rate, setIsComparisonVisible } =
    swapStore();
  const network = getBitcoinNetwork();
  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { networkFeesValue } = useNetworkFees(network, outputAsset);

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const protocolFee = useMemo(() => getProtocolFee(fees), [fees]);
  const totalCost = fees + networkFeesValue;

  const isBitcoinChains = outputAsset?.symbol.includes(BTC.symbol);
  const formattedRate = useMemo(
    () => Number(rate.toFixed(isBitcoinChains ? 7 : 3)),
    [isBitcoinChains, rate]
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
                key="rate"
                {...fadeAnimation}
                className="absolute left-0 flex items-center justify-start gap-1"
              >
                <Typography
                  size="h5"
                  weight="medium"
                  className="!flex !text-mid-grey"
                >
                  Total cost
                </Typography>
                <span
                  ref={targetRef}
                  className="inline-block cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <InfoIcon className="h-3 w-3 !fill-mid-grey" />
                  {isHovered && inputAsset && outputAsset && (
                    <TooltipWrapper targetRef={targetRef}>
                      <CostToolTip
                        networkFee={networkFeesValue}
                        protocolFee={protocolFee}
                        rate={formattedRate}
                      />
                    </TooltipWrapper>
                  )}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1">
            <AnimatePresence mode="wait">
              <motion.div
                key="fees-content"
                {...delayedFadeAnimation}
                className="flex items-center gap-1"
              >
                <Typography size="h5" weight="medium">
                  ${formatAmount(totalCost, 0, 2)}
                </Typography>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {(maxTimeSaved > 0 ||
                maxCostSaved > 0 ||
                receiveAddress ||
                refundAddress) && (
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
              )}
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
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
