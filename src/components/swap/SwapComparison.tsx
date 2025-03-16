import { ArrowLeftIcon, Typography } from "@gardenfi/garden-book";
import { FC, useEffect, useMemo, useState } from "react";
import { SwapInfo } from "../../common/SwapInfo";
import { swapStore } from "../../store/swapStore";
import {
  getChainflipFee,
  getRelayFee,
  getThorFee,
} from "../../utils/getFeeRateAndEstimatedSwapTime";

type SwapComparisonProps = {
  visible: boolean;
  hide: () => void;
  isTime?: boolean;
  isFees?: boolean;
  gardenFee: number;
  gardenSwapTime: string;
  onComparisonUpdate: (maxTimeSaved: number, maxCostSaved: number) => void;
};

export const SwapComparison: FC<SwapComparisonProps> = ({
  visible,
  hide,
  isTime,
  isFees,
  gardenFee,
  gardenSwapTime,
  onComparisonUpdate,
}) => {
  const [swapData, setSwapData] = useState<Record<
    string,
    { fee: string; time: string }
  > | null>(null);

  const { inputAsset, outputAsset, inputAmount, outputAmount } = swapStore();

  const swapSources = [
    { name: "Relay", key: "Relay", icon: "/public/relay.svg" },
    { name: "chainflip", key: "Chainflip", icon: "/public/chainflip.svg" },
    { name: "thorswap", key: "Thorswap", icon: "/public/thorswap.svg" },
  ];

  const parseTime = (time: string | undefined) => {
    if (!time) return 0;

    const cleanedTime = time.replace("~", "").trim();
    const match = cleanedTime.match(/(?:(\d+)m)?\s*(?:(\d+)s)?/);

    if (!match) return 0;

    const minutes = match[1] ? parseInt(match[1]) : 0;
    const seconds = match[2] ? parseInt(match[2]) : 0;

    return minutes * 60 + seconds;
  };

  const formatTimeDiff = (time: string) => {
    const diff = parseTime(time) - parseTime(gardenSwapTime);
    const sign = diff >= 0 ? "+" : "-";
    return `${sign}${Math.floor(Math.abs(diff) / 60)}m ${Math.abs(diff) % 60}s`;
  };

  const swapEntries = useMemo(
    () => (swapData ? Object.entries(swapData) : []),
    [swapData]
  );

  useEffect(() => {
    const fetchAllData = async () => {
      if (inputAsset && outputAsset && inputAmount) {
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
                return fee === "-" && time === "-" ? null : { key, fee, time };
              } catch {
                // Suppress error
              }
            })
          );

          const filteredResults = results.filter(Boolean) as {
            key: string;
            fee: string;
            time: string;
          }[];

          const newData = filteredResults.reduce(
            (acc, { key, fee, time }) => {
              acc[key] = { fee, time };
              return acc;
            },
            {} as Record<string, { fee: string; time: string }>
          );

          setSwapData(newData);
        } catch {
          // Do nothing, suppress all errors
        }
      }
    };

    fetchAllData();
  }, [inputAsset, outputAsset, inputAmount]);

  useEffect(() => {
    if (!swapData || swapEntries.length === 0) {
      onComparisonUpdate(0, 0);
      return;
    }

    let maxTimeSaved = 0;
    let maxCostSaved = 0;

    Object.values(swapData).forEach(({ fee, time }) => {
      const timeDiff = parseTime(time) - parseTime(gardenSwapTime);
      maxTimeSaved = Math.max(maxTimeSaved, timeDiff);

      const feeDiff = Number(fee) - gardenFee;
      maxCostSaved = Math.max(maxCostSaved, feeDiff);
    });

    onComparisonUpdate(maxTimeSaved, maxCostSaved);
  }, [
    swapData,
    gardenSwapTime,
    gardenFee,
    onComparisonUpdate,
    swapEntries.length,
  ]);

  return (
    <div
      className={`absolute top-0 flex flex-col gap-3 rounded-[20px] bg-primary-lighter ${
        visible ? "left-0" : "left-full"
      } transition-left z-30 h-full w-full p-3 duration-700 ease-in-out`}
    >
      <div className="flex items-center justify-between p-1">
        <Typography size="h4" weight="bold">
          {isTime
            ? "Time Comparison"
            : isFees
              ? "Cost Comparison"
              : "Comparison"}
        </Typography>
        <ArrowLeftIcon className="cursor-pointer" onClick={hide} />
      </div>

      {inputAsset && outputAsset && inputAmount && outputAmount && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
          <SwapInfo
            sendAsset={inputAsset}
            receiveAsset={outputAsset}
            sendAmount={inputAmount}
            receiveAmount={outputAmount}
          />
        </div>
      )}

      <div className="flex h-full gap-10 rounded-2xl bg-white p-4">
        <div className="flex flex-grow flex-col gap-2">
          {swapEntries.map(([key], index) => {
            const source = swapSources.find((s) => s.key === key);
            return (
              <div key={key} className="flex items-center gap-2 p-1">
                <Typography size="h4" weight="medium" className="mr-2 w-[20px]">
                  #{index + 1}
                </Typography>
                {source && (
                  <img
                    src={source.icon}
                    alt={source.name}
                    className="h-4 w-4"
                  />
                )}
                <Typography size="h4" weight="medium">
                  {source?.name || key}
                </Typography>
              </div>
            );
          })}
        </div>

        {isTime && swapEntries.length > 0 && (
          <div className="flex flex-row gap-6">
            <div className="flex flex-col gap-2">
              {swapEntries.map(([key, { time }]) => (
                <Typography
                  key={key}
                  className="p-1 !text-red-500"
                  size="h4"
                  weight="medium"
                >
                  {formatTimeDiff(time)}
                </Typography>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {swapEntries.map(([key, { time }]) => (
                <Typography key={key} className="p-1" size="h4" weight="medium">
                  {time}
                </Typography>
              ))}
            </div>
          </div>
        )}

        {isFees && swapEntries.length > 0 && (
          <div className="flex flex-row gap-6">
            <div className="flex flex-col gap-2">
              {swapEntries.map(([key, { fee }]) => {
                const feeDiff = (Number(fee) - gardenFee).toFixed(2);
                return (
                  <Typography
                    key={key}
                    className="p-1 !text-red-500"
                    size="h4"
                    weight="medium"
                  >
                    {`${Number(feeDiff) >= 0 ? "+" : "-"}$${Math.abs(Number(feeDiff))}`}
                  </Typography>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              {swapEntries.map(([key, { fee }]) => (
                <Typography key={key} className="p-1" size="h4" weight="medium">
                  {`$${fee}`}
                </Typography>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
