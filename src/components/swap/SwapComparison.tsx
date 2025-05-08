import {
  ArrowLeftIcon,
  ChainflipIcon,
  GardenLogo,
  RelayLinkIcon,
  ThorswapIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { SwapInfo } from "../../common/SwapInfo";
import { swapStore } from "../../store/swapStore";
import {
  formatTime,
  formatTimeDiff,
  parseTime,
} from "../../utils/timeAndFeeComparison/utils";
import { getTimeEstimates } from "../../constants/constants";
import { useSwap } from "../../hooks/useSwap";
import { Errors } from "../../constants/errors";
import { motion } from "framer-motion";
import { formatAmount } from "../../utils/utils";
import debounce from "lodash.debounce";
import { Asset } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { comparisonMetric } from "../../utils/timeAndFeeComparison/constants";
import { getRelayFee } from "../../utils/timeAndFeeComparison/RelayFees";
import { getChainflipFee } from "../../utils/timeAndFeeComparison/ChainFlipFees";
import { getThorFee } from "../../utils/timeAndFeeComparison/ThosSwapFees";

type SwapComparisonProps = {
  visible: boolean;
  hide: () => void;
  isTime?: boolean;
  isFees?: boolean;
  onComparisonUpdate: (maxTimeSaved: number, maxCostSaved: number) => void;
};

export const SwapComparison: FC<SwapComparisonProps> = ({
  visible,
  hide,
  isTime,
  isFees,
  onComparisonUpdate,
}) => {
  const animationConfig = {
    initial: { x: "100%" },
    animate: { x: visible ? 0 : "100%" },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 0.8,
    },
  };

  const [swapData, setSwapData] = useState<Record<
    string,
    comparisonMetric
  > | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const prevInputAmountRef = useRef<string | number>();
  const prevOutputAssetRef = useRef<Asset | undefined>(undefined);
  const prevInputAssetRef = useRef<Asset | undefined>(undefined);

  const { error } = useSwap();
  const { inputAsset, outputAsset, inputAmount, outputAmount, tokenPrices } =
    swapStore();

  const swapSources = [
    { name: "garden", key: "garden", icon: <GardenLogo /> },
    { name: "Relay", key: "Relay", icon: <RelayLinkIcon /> },
    { name: "Chainflip", key: "Chainflip", icon: <ChainflipIcon /> },
    { name: "THORSwap", key: "Thorswap", icon: <ThorswapIcon /> },
  ];

  const gardenFee = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const gardenSwapTime = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const swapEntriesWithGarden = useMemo(() => {
    if (!swapData) return [];

    const gardenTimeParsed = parseTime(gardenSwapTime);
    const gardenEntry: [string, comparisonMetric] = [
      "garden",
      { fee: gardenFee, time: gardenTimeParsed },
    ];

    let entries = Object.entries(swapData);

    if (isFees) {
      entries = entries.sort((a, b) => a[1].fee - b[1].fee);
    } else if (isTime) {
      entries = entries.sort((a, b) => a[1].time - b[1].time);
    }

    const filteredEntries = entries.filter(([, data]) => {
      if (isTime) {
        return data.time >= gardenTimeParsed;
      } else if (isFees) {
        return data.fee >= gardenFee;
      }
      return true;
    });

    return [
      gardenEntry,
      ...filteredEntries.map(
        ([key, data]) => [key, data] as [string, comparisonMetric]
      ),
    ];
  }, [swapData, gardenFee, gardenSwapTime, isTime, isFees]);

  const debouncedFetchAllData = useMemo(() => {
    return debounce(async (inputAsset, outputAsset, inputAmount) => {
      if (inputAsset && outputAsset && inputAmount) {
        setLoading(true);
        try {
          const sources = {
            Relay: getRelayFee,
            Thorswap: getThorFee,
            Chainflip: getChainflipFee,
          };

          const results = await Promise.all(
            Object.entries(sources).map(async ([key, fetchFn]) => {
              try {
                const { fee, time } = await fetchFn(
                  inputAsset,
                  outputAsset,
                  Number(inputAmount)
                );
                return fee === 0 && time === 0 ? null : { key, fee, time };
              } catch {
                // Suppress error
              }
            })
          );

          const filteredResults = results.filter(Boolean) as {
            key: string;
            fee: number;
            time: number;
          }[];

          const newData = filteredResults.reduce(
            (acc, { key, fee, time }) => {
              acc[key] = { fee, time };
              return acc;
            },
            {} as Record<string, comparisonMetric>
          );

          setSwapData(newData);
        } catch {
          // suppress error
        } finally {
          setLoading(false);
        }
      }
    }, 300); // debounce delay
  }, []);

  useEffect(() => {
    const numericInputAmount = Number(inputAmount);
    const prevNumericInputAmount = Number(prevInputAmountRef.current);

    if (
      inputAsset &&
      outputAsset &&
      ((numericInputAmount && prevNumericInputAmount !== numericInputAmount) ||
        outputAsset !== prevOutputAssetRef.current ||
        inputAsset !== prevInputAssetRef.current)
    ) {
      prevInputAmountRef.current = numericInputAmount;
      prevOutputAssetRef.current = outputAsset;
      debouncedFetchAllData(inputAsset, outputAsset, numericInputAmount);
    }
  }, [
    inputAmount,
    inputAsset,
    outputAsset,
    outputAmount,
    debouncedFetchAllData,
  ]);

  useEffect(() => {
    return () => {
      debouncedFetchAllData.cancel?.();
    };
  }, [debouncedFetchAllData]);

  useEffect(() => {
    if (
      loading ||
      !swapData ||
      swapEntriesWithGarden.length === 1 ||
      !inputAmount ||
      error.inputError ||
      error.outputError ||
      error.swapError === Errors.insufficientLiquidity
    ) {
      onComparisonUpdate(0, 0);
      return;
    }

    let maxTimeSaved = 0;
    let maxCostSaved = 0;

    Object.values(swapData).forEach(({ fee, time }) => {
      const timeDiff = time - parseTime(gardenSwapTime);
      const feeDiff = fee - gardenFee;
      maxTimeSaved = Math.max(maxTimeSaved, timeDiff);
      maxCostSaved = Math.max(maxCostSaved, feeDiff);
    });

    onComparisonUpdate(maxTimeSaved, maxCostSaved);
  }, [
    swapData,
    gardenSwapTime,
    gardenFee,
    onComparisonUpdate,
    loading,
    inputAmount,
    error.inputError,
    error.outputError,
    error.swapError,
    swapEntriesWithGarden.length,
  ]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [hide]);

  const inputAmountInDecimals =
    inputAmount &&
    inputAsset &&
    new BigNumber(inputAmount)
      .multipliedBy(10 ** inputAsset.decimals)
      .toFixed();
  const outputAmountInDecimals =
    outputAmount &&
    outputAsset &&
    new BigNumber(outputAmount)
      .multipliedBy(10 ** outputAsset.decimals)
      .toFixed();

  return (
    <motion.div
      {...animationConfig}
      className="absolute left-0 top-0 z-30 flex h-full w-full flex-col gap-3 rounded-[20px] bg-primary-lighter p-3"
    >
      <div className="flex items-center justify-between p-1">
        <Typography size="h4" weight="bold">
          {isTime ? "Time saved" : isFees ? "Cost saved" : "Saved"}
        </Typography>
        <ArrowLeftIcon className="cursor-pointer" onClick={hide} />
      </div>

      {inputAsset &&
        outputAsset &&
        inputAmountInDecimals &&
        outputAmountInDecimals && (
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
            <SwapInfo
              equalSplit={true}
              sendAsset={inputAsset}
              receiveAsset={outputAsset}
              sendAmount={formatAmount(
                inputAmountInDecimals,
                inputAsset.decimals
              )}
              receiveAmount={formatAmount(
                outputAmountInDecimals,
                outputAsset.decimals
              )}
            />
          </div>
        )}

      <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-4">
        {swapEntriesWithGarden.map(([key, { fee, time }], index) => {
          const source = swapSources.find((s) => s.key === key);
          const feeDiff = (Number(fee) - gardenFee).toFixed(2);

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography size="h5" weight="medium" className="mr-2 w-[20px]">
                  #{index + 1}
                </Typography>
                <div className="flex h-4 w-4 items-center justify-center">
                  {source && source.icon}
                </div>
                <Typography size="h5" weight="medium">
                  {source?.name || key}
                </Typography>
              </div>
              {isTime && (
                <div className="flex gap-6">
                  {key !== "garden" && (
                    <Typography
                      className="!text-rose"
                      size="h5"
                      weight="medium"
                    >
                      {formatTimeDiff(time, gardenSwapTime)}
                    </Typography>
                  )}
                  <Typography
                    className="!flex !w-16 !justify-end"
                    size="h5"
                    weight="medium"
                  >
                    {formatTime(time)}
                  </Typography>
                </div>
              )}
              {isFees && (
                <div className="flex gap-6">
                  {key !== "garden" && (
                    <Typography
                      className="!text-rose"
                      size="h5"
                      weight="medium"
                    >
                      {`${Number(feeDiff) >= 0 ? "+" : "-"}$${Math.abs(Number(feeDiff))}`}
                    </Typography>
                  )}
                  <Typography
                    className="!flex !w-12 !justify-end"
                    size="h5"
                    weight="medium"
                  >
                    {`$${formatAmount(fee, 0, 2)}`}
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
