import { useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { getChainflipFee } from "../utils/timeAndFeeComparison/ChainFlipFees";
import { getRelayFee } from "../utils/timeAndFeeComparison/RelayFees";
import { getThorFee } from "../utils/timeAndFeeComparison/ThorSwapFees";
import { comparisonMetric } from "../utils/timeAndFeeComparison/constants";
import { Asset } from "@gardenfi/orderbook";
import { swapStore } from "../store/swapStore";
import { parseTime } from "../utils/timeAndFeeComparison/utils";
import { getTimeEstimates } from "../constants/constants";
import { useSwap } from "./useSwap";
import { ChainflipIcon } from "@gardenfi/garden-book";
import { RelayLinkIcon } from "@gardenfi/garden-book";
import { GardenLogo } from "@gardenfi/garden-book";
import { ThorswapIcon } from "@gardenfi/garden-book";

type UseCompetitorTimeFeesProps = {
  isTime: boolean;
  isFees: boolean;
  onComparisonUpdate: (maxTimeSaved: number, maxCostSaved: number) => void;
};

export const useCompetitorTimeFees = ({
  isTime,
  isFees,
  onComparisonUpdate,
}: UseCompetitorTimeFeesProps) => {
  const [swapData, setSwapData] = useState<Record<
    string,
    comparisonMetric
  > | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const prevInputAmountRef = useRef<string | number>();
  const prevOutputAssetRef = useRef<Asset | undefined>(undefined);
  const prevInputAssetRef = useRef<Asset | undefined>(undefined);

  const swapSources = [
    { name: "garden", key: "garden", icon: <GardenLogo /> },
    { name: "Relay", key: "Relay", icon: <RelayLinkIcon /> },
    { name: "Chainflip", key: "Chainflip", icon: <ChainflipIcon /> },
    { name: "THORSwap", key: "Thorswap", icon: <ThorswapIcon /> },
  ];

  const {
    inputAsset,
    outputAsset,
    inputAmount,
    outputAmount,
    tokenPrices,
    isComparisonVisible,
  } = swapStore();

  const { error } = useSwap();

  const debouncedFetchAllData = useMemo(() => {
    return debounce(async (inputAsset, outputAsset, inputAmount) => {
      if (inputAsset && outputAsset && inputAmount && (!isTime || !isFees)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (isComparisonVisible) {
      debouncedFetchAllData.cancel();
      setSwapData(null);
    }
  }, [debouncedFetchAllData, isComparisonVisible]);

  useEffect(() => {
    if (
      loading ||
      !swapData ||
      swapEntriesWithGarden.length === 1 ||
      !inputAmount ||
      error.inputError ||
      error.outputError ||
      error.liquidityError
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
    error.liquidityError,
    swapEntriesWithGarden.length,
  ]);

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

  return {
    swapSources,
    gardenFee,
    gardenSwapTime,
    swapEntriesWithGarden,
    loading,
  };
};
