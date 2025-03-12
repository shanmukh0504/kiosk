import { ArrowLeftIcon, Typography } from "@gardenfi/garden-book";
import { FC, useEffect, useState } from "react";
import { SwapInfo } from "../../common/SwapInfo";
import { swapStore } from "../../store/swapStore";
import { getChainflipFee, getRelayFee, getThorFee } from "../../utils/getFeeRateAndEstimatedSwapTime";

type SwapComparisonProps = {
  visible: boolean;
  hide: () => void;
  isTime?: boolean;
  isFees?: boolean;
};

export const SwapComparison: FC<SwapComparisonProps> = ({
  visible,
  hide,
  isTime,
  isFees,
}) => {
  const { inputAsset, outputAsset, inputAmount, outputAmount } = swapStore();
  const [swapData, setSwapData] = useState<Record<
    string,
    { fee: string; time: string }
  > | null>(null);



  useEffect(() => {
    const fetchAllData = async () => {
      if (inputAsset && outputAsset && inputAmount) {
        try {
          const sources = {
            relay: getRelayFee,
            thor: getThorFee,
            chainflip: getChainflipFee,
          };

          const results = await Promise.all(
            Object.entries(sources).map(async ([key, fetchFn]) => {
              const { fee, time } = await fetchFn(
                inputAsset,
                outputAsset,
                Number(inputAmount)
              );
              return { key, fee, time };
            })
          );

          const newData = results.reduce((acc, { key, fee, time }) => {
            acc[key] = { fee, time };
            return acc;
          }, {} as Record<string, { fee: string; time: string }>);

          setSwapData(newData);
        } catch (error) {
          console.error("Error fetching competitor data:", error);
        }
      }
    };

    fetchAllData();
  }, [inputAsset, outputAsset, inputAmount]);

  return (
    <div
      className={`absolute top-0 flex flex-col gap-3 rounded-[20px] bg-primary-lighter ${visible ? "left-0" : "left-full"} transition-left z-30 h-full w-full p-3 duration-700 ease-in-out`}
    >
      <div className="flex items-center justify-between p-1">
        <Typography size="h4" weight="bold">
          {isTime
            ? "Time Comparison"
            : isFees
              ? "Cost Comparison"
              : "Comparison"}
        </Typography>
        <ArrowLeftIcon className="cursor-pointer" onClick={() => hide()} />
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
          <Typography className="p-1" size="h4" weight="medium">
            Relay
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            THORSwap
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            Chainflip
          </Typography>
        </div>

        {/* Time Comparison */}
        <div className="flex flex-col gap-2">
          <Typography className="p-1" size="h4" weight="medium">
            {swapData?.relay ? `~${swapData.relay.time}` : "-"}
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            {swapData?.thor ? `~${swapData.thor.time}` : "-"}
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            {swapData?.chainflip ? `~${swapData.chainflip.time}` : "-"}
          </Typography>
        </div>

        {/* Fee Comparison */}
        <div className="flex flex-col gap-2">
          <Typography className="p-1" size="h4" weight="medium">
            {swapData?.relay ? `$${swapData.relay.fee}` : "-"}
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            {swapData?.thor ? `$${swapData.thor.fee}` : "-"}
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            {swapData?.chainflip ? `$${swapData.chainflip.fee}` : "-"}
          </Typography>
        </div>
      </div>
    </div>
  );
};
