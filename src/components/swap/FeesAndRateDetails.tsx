import { useState, useMemo, useRef, useEffect } from "react";
import {
  GasStationIcon,
  InfoIcon,
  KeyboardDownIcon,
  SwapHorizontalIcon,
  Typography,
} from "@gardenfi/garden-book";
import { BTC, swapStore } from "../../store/swapStore";

import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Asset, isBitcoin, isSolana } from "@gardenfi/orderbook";
import { motion, AnimatePresence } from "framer-motion";
import { delayedFadeAnimation } from "../../animations/animations";
import { SwapSavingsAndAddresses } from "./SwapSavingsAndAddresses";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { TooltipWrapper } from "../../common/ToolTipWrapper";
import { formatAmount, formatAmountUsd } from "../../utils/utils";

const RateDisplay = ({
  inputAsset,
  outputAsset,
  formattedRate,
  formattedTokenPrice,
  className = "",
  isFetchingQuote = false,
}: {
  inputAsset?: Asset;
  outputAsset?: Asset;
  formattedRate?: string | number;
  formattedTokenPrice?: string | number;
  isFetchingQuote?: boolean;
  className?: string;
}) => (
  <div className={`flex min-w-fit items-center gap-1`}>
    <Typography
      size="h5"
      weight="regular"
      className={`!text-nowrap ${className}`}
    >
      1 {inputAsset?.symbol}
    </Typography>
    <Typography
      size="h5"
      weight="regular"
      className={`!text-nowrap ${className}`}
    >
      {formattedTokenPrice ? (
        "≈"
      ) : (
        <SwapHorizontalIcon className="fill-dark-grey" />
      )}
    </Typography>
    {isFetchingQuote ? (
      <div className="h-4 w-11 animate-[pulse_1.5s_ease-in-out_infinite] rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"></div>
    ) : (
      <Typography
        size="h5"
        weight="regular"
        className={`!text-nowrap ${className}`}
      >
        {formattedRate && `${formattedRate}`}
        {formattedTokenPrice && `$${formattedTokenPrice}`}
      </Typography>
    )}
    {formattedRate && (
      <Typography
        size="h5"
        weight="regular"
        className={`!text-nowrap ${className}`}
      >
        {outputAsset?.symbol}
      </Typography>
    )}
  </div>
);

export const FeesAndRateDetails = () => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState(false);
  const previousAssets = useRef<{
    inputAsset?: Asset;
    outputAsset?: Asset;
  }>({});
  const targetRef = useRef<HTMLDivElement>(null);

  const {
    inputAsset,
    outputAsset,
    rate,
    networkFees,
    showComparisonHandler,
    fiatTokenPrices,
    isFetchingQuote,
  } = swapStore();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { address } = useEVMWallet();

  const isBitcoinChains = outputAsset?.symbol.includes(BTC.symbol);
  const formattedRate = useMemo(
    () => formatAmount(rate, 0, isBitcoinChains ? 7 : 3),
    [isBitcoinChains, rate]
  );

  const formattedTokenPrice = useMemo(
    () => formatAmountUsd(fiatTokenPrices.input, 0),
    [fiatTokenPrices.input]
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

  useEffect(() => {
    const assetChanged =
      previousAssets.current.inputAsset?.symbol !== inputAsset?.symbol ||
      previousAssets.current.inputAsset?.chain !== inputAsset?.chain ||
      previousAssets.current.outputAsset?.symbol !== outputAsset?.symbol ||
      previousAssets.current.outputAsset?.chain !== outputAsset?.chain;

    if (assetChanged && inputAsset && outputAsset) {
      setIsAssetLoading(true);
      previousAssets.current = { inputAsset, outputAsset };
    }
    if (!isFetchingQuote.input && !isFetchingQuote.output && !assetChanged) {
      setIsAssetLoading(false);
    }
  }, [inputAsset, outputAsset, isFetchingQuote.input, isFetchingQuote.output]);

  return (
    <div className="flex flex-col rounded-2xl bg-white/50 pb-4 transition-all duration-200">
      <div className="flex w-full items-center justify-between rounded-2xl px-4 pt-4">
        <div className="relative flex w-full items-center justify-start gap-1">
          <AnimatePresence mode="wait">
            {isDetailsExpanded ? (
              <motion.div
                key="expanded"
                className="w-fit"
                {...delayedFadeAnimation}
              >
                <div className="flex items-center gap-1">
                  <Typography
                    size="h5"
                    weight="regular"
                    className="!text-mid-grey"
                  >
                    Rate
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
                        <RateDisplay
                          inputAsset={inputAsset}
                          outputAsset={outputAsset}
                          formattedRate={formattedRate}
                          isFetchingQuote={isAssetLoading}
                        />
                      </TooltipWrapper>
                    )}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className="w-fit"
                {...delayedFadeAnimation}
              >
                <RateDisplay
                  inputAsset={inputAsset}
                  outputAsset={outputAsset}
                  formattedTokenPrice={formattedTokenPrice}
                  className="!text-mid-grey"
                  isFetchingQuote={isAssetLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex w-full items-center justify-end gap-1">
          <AnimatePresence mode="wait">
            {isDetailsExpanded ? (
              <motion.div
                key="expanded"
                className="w-fit"
                {...delayedFadeAnimation}
              >
                <RateDisplay
                  inputAsset={inputAsset}
                  outputAsset={outputAsset}
                  formattedTokenPrice={formattedTokenPrice}
                  isFetchingQuote={isAssetLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className="w-fit"
                {...delayedFadeAnimation}
              >
                <div className="flex min-w-fit items-center gap-1">
                  <GasStationIcon className="h-3 w-3" />
                  <Typography
                    size="h5"
                    weight="regular"
                    className="!text-nowrap"
                  >
                    {networkFees === 0 ? (
                      "Free"
                    ) : (
                      <span className="flex items-center">
                        ${formatAmountUsd(networkFees, 0)}
                      </span>
                    )}
                  </Typography>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ width: 0, scale: 0, opacity: 0 }}
          animate={{ width: "auto", scale: 1, opacity: 1 }}
          exit={{ width: 0, scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="pl-1"
        >
          <KeyboardDownIcon
            className={`h-4 w-4 cursor-pointer px-1 transition-transform duration-300 ${
              isDetailsExpanded ? "rotate-180" : ""
            }`}
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {isDetailsExpanded && (
          <SwapSavingsAndAddresses
            refundAddress={refundAddress}
            receiveAddress={receiveAddress}
            showComparison={showComparisonHandler}
            networkFeesValue={Number(formatAmountUsd(networkFees, 0))}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
