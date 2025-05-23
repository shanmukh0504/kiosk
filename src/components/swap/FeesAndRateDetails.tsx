import { useState, useMemo, useEffect } from "react";
import {
  GasStationIcon,
  KeyboardDownIcon,
  SwapHorizontalIcon,
  Typography,
} from "@gardenfi/garden-book";
import { swapStore } from "../../store/swapStore";
import { CompetitorComparisons } from "./CompetitorComparisons";
import { AddressDetails } from "./AddressDetails";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion, AnimatePresence } from "framer-motion";
import { formatAmount, getProtocolFee } from "../../utils/utils";
import { formatTime } from "../../utils/timeAndFeeComparison/utils";
import { getBitcoinNetwork } from "../../constants/constants";
import { useNetworkFees } from "../../hooks/useNetworkFees";
import {
  expandAnimation,
  fadeAnimation,
  delayedFadeAnimation,
  expandWithDelayAnimation,
} from "../../animations/animations";

export const FeesAndRateDetails = () => {
  const { tokenPrices } = swapStore();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showComparison, setIsShowComparison] = useState({
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);
  const [rate, setRate] = useState(0);

  const { inputAsset, outputAsset, inputAmount, outputAmount } = swapStore();
  const { setIsComparisonVisible } = swapStore();
  const network = getBitcoinNetwork();
  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { networkFeesValue, isLoading: isNetworkFeesLoading } = useNetworkFees(
    network,
    outputAsset
  );

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const protocolFee = useMemo(() => getProtocolFee(fees), [fees]);

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

  useEffect(() => {
    if (!outputAmount || !inputAmount || !outputAsset) {
      setRate(0);
      return;
    }
    const calculatedRate = Number(outputAmount) / Number(inputAmount);
    const isBitcoinChain = isBitcoin(outputAsset.chain);
    const decimals = isBitcoinChain ? 7 : 2;

    if (calculatedRate < 0.000001) {
      setRate(0);
      return;
    }

    const formatted = Number(
      formatAmount(calculatedRate, 0, decimals).toFixed(decimals)
    );
    setRate(formatted);
  }, [outputAmount, inputAmount, outputAsset]);

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
          <div className="relative flex items-center justify-start">
            <AnimatePresence mode="wait">
              {isDetailsExpanded ? (
                <motion.div
                  key="details"
                  {...fadeAnimation}
                  className="absolute left-0"
                >
                  <Typography size="h5" weight="bold" className="py-[2px]">
                    Details
                  </Typography>
                </motion.div>
              ) : (
                <motion.div
                  key="rate"
                  {...fadeAnimation}
                  className="absolute left-0 flex items-center justify-start gap-1"
                >
                  <Typography size="h5" weight="medium">
                    1
                  </Typography>
                  <Typography size="h5" weight="medium">
                    {inputAsset?.symbol}
                  </Typography>
                  <SwapHorizontalIcon />
                  <Typography size="h5" weight="medium">
                    {formatAmount(rate, 0, 3)}
                  </Typography>
                  <Typography size="h5" weight="medium">
                    {outputAsset?.symbol}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1">
            <AnimatePresence mode="wait">
              {!isDetailsExpanded && (
                <motion.div
                  key="fees-content"
                  {...delayedFadeAnimation}
                  className="flex items-center gap-1"
                >
                  <GasStationIcon />
                  <Typography size="h5" weight="medium">
                    {fees ? "$" + protocolFee : ""}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
            <KeyboardDownIcon
              className={`h-4 w-4 cursor-pointer px-1 transition-transform duration-300 ${
                isDetailsExpanded ? "rotate-180" : ""
              }`}
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            />
          </div>
        </div>
        <AnimatePresence>
          {isDetailsExpanded && (
            <motion.div className="flex flex-col" {...expandWithDelayAnimation}>
              <div className="mt-3 flex items-center justify-between gap-0 px-4 py-1">
                <Typography
                  size="h5"
                  weight="medium"
                  className="!py-[2px] !text-mid-grey"
                >
                  Protocol fee
                </Typography>
                <div className="flex gap-5">
                  <Typography size="h4" weight="medium">
                    {fees ? "$" + protocolFee : ""}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center justify-between gap-0 px-4 py-1">
                <Typography
                  size="h5"
                  weight="medium"
                  className="!text-mid-grey"
                >
                  Network fee
                </Typography>
                <div className="relative flex gap-5 overflow-hidden rounded-md">
                  {outputAsset && !isBitcoin(outputAsset.chain) ? (
                    <Typography size="h4" weight="medium">
                      Free
                    </Typography>
                  ) : (
                    <Typography size="h4" weight="medium">
                      {isNetworkFeesLoading ? (
                        <div className="h-5 w-10 animate-pulse rounded-md bg-gray-200" />
                      ) : (
                        networkFeesValue
                      )}
                    </Typography>
                  )}
                </div>
              </div>
              <AnimatePresence mode="wait">
                {(maxTimeSaved > 0 || maxCostSaved > 0) && (
                  <motion.div {...expandAnimation}>
                    <div
                      className="z-10 mx-4 my-1 h-px bg-white"
                      {...expandAnimation}
                    ></div>
                    {maxTimeSaved > 0 && (
                      <motion.div
                        key="time-saved"
                        {...expandAnimation}
                        className="h-full w-full"
                      >
                        <div
                          className="relative z-10 flex cursor-pointer items-center justify-between gap-0 px-4 transition-all duration-200 ease-in-out hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowComparison("time");
                          }}
                        >
                          <Typography
                            size="h5"
                            weight="medium"
                            className="!text-mid-grey"
                          >
                            Time saved
                          </Typography>
                          <div className="flex gap-5 py-1">
                            <Typography
                              size="h4"
                              weight="medium"
                              className="!text-light-green"
                            >
                              {formatTime(maxTimeSaved)}
                            </Typography>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {maxCostSaved > 0 && (
                      <motion.div
                        key="cost-saved"
                        {...expandAnimation}
                        className="w-full"
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between gap-0 px-4 transition-all duration-200 ease-in-out hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowComparison("fees");
                          }}
                        >
                          <Typography
                            size="h5"
                            weight="medium"
                            className="!text-mid-grey"
                          >
                            Cost saved
                          </Typography>
                          <div className="flex gap-5 py-1">
                            <Typography
                              size="h4"
                              weight="medium"
                              className="!text-light-green"
                            >
                              {`$${formatAmount(maxCostSaved, 0, 2).toFixed(2)}`}
                            </Typography>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {(receiveAddress || refundAddress) && (
                <>
                  <div className="mx-4 my-1 h-px bg-white"></div>
                  <div className="flex flex-col items-stretch justify-center">
                    {receiveAddress && (
                      <AddressDetails address={receiveAddress} />
                    )}
                    {refundAddress && (
                      <AddressDetails address={refundAddress} isRefund />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
