import { useState, useMemo, useRef, useEffect } from "react";
import {
  GasStationIcon,
  InfoIcon,
  KeyboardDownIcon,
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
import {
  formatAmount,
  formatAmountUsd,
  isAlpenSignetChain,
} from "../../utils/utils";
import { assetInfoStore } from "../../store/assetInfoStore";
import { RateAndPriceDisplay } from "./RateAndPriceDisplay";

export const FeesAndRateDetails = () => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRateLoading, setIsRateLoading] = useState(false);
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
    isFetchingQuote,
  } = swapStore();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { address } = useEVMWallet();
  const { assets, fiatData } = assetInfoStore();

  const isBitcoinChains = outputAsset?.symbol.includes(BTC.symbol);
  const formattedRate = useMemo(
    () => formatAmount(rate, 0, isBitcoinChains ? 7 : 3),
    [isBitcoinChains, rate]
  );

  const formattedTokenPrice = useMemo(() => {
    if (!inputAsset || !inputAsset.id) return "";
    let price = fiatData?.[inputAsset.id.toString()] ?? inputAsset.price;

    if (isBitcoin(inputAsset.chain)) {
      const btcAsset = Object.values(assets ?? assets ?? {}).find((a) =>
        isBitcoin(a.chain)
      );
      if (btcAsset) {
        price =
          fiatData?.[btcAsset.id.toString()] ?? btcAsset.price ?? price ?? 0;
      }
    }
    return formatAmountUsd(price, 0);
  }, [inputAsset, assets, fiatData]);
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
      previousAssets.current.inputAsset !== inputAsset ||
      previousAssets.current.outputAsset !== outputAsset;

    if (assetChanged && inputAsset && outputAsset) {
      setIsRateLoading(true);
      previousAssets.current = { inputAsset, outputAsset };
    }
    if (!isFetchingQuote.input && !isFetchingQuote.output && !assetChanged) {
      setIsRateLoading(false);
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
                        <RateAndPriceDisplay
                          inputToken={inputAsset?.symbol}
                          outputToken={outputAsset?.symbol}
                          rate={formattedRate}
                          isLoading={isRateLoading}
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
                <RateAndPriceDisplay
                  inputToken={inputAsset?.symbol}
                  outputToken={outputAsset?.symbol}
                  tokenPrice={formattedTokenPrice}
                  className="!text-mid-grey"
                  isLoading={isRateLoading}
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
                <RateAndPriceDisplay
                  inputToken={inputAsset?.symbol}
                  tokenPrice={formattedTokenPrice}
                  isLoading={isRateLoading}
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
            refundAddress={
              inputAsset?.chain && isAlpenSignetChain(inputAsset.chain)
                ? undefined
                : refundAddress
            }
            receiveAddress={
              outputAsset?.chain && isAlpenSignetChain(outputAsset.chain)
                ? undefined
                : receiveAddress
            }
            showComparison={showComparisonHandler}
            networkFeesValue={Number(formatAmountUsd(networkFees, 0))}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
