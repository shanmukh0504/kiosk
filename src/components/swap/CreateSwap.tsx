import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { swapStore } from "../../store/swapStore";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useMemo } from "react";
import { MatchedOrder } from "@gardenfi/orderbook";
import { Toast } from "../toast/Toast";
import { formatAmount } from "../../utils/utils";
import { useSwap } from "../../hooks/useSwap";
import { SwapFees } from "./SwapFees";

export const CreateSwap = () => {
  const { assets } = assetInfoStore();
  const { swapAssets } = swapStore();
  const {
    outputAmount,
    inputAmount,
    inputAsset,
    outputAsset,
    handleInputAmountChange,
    handleOutputAmountChange,
    loading,
    error,
    tokenPrices,
    validSwap,
    inputTokenBalance,
    isInsufficientBalance,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
  } = useSwap();
  const { garden } = useGarden();

  const buttonLabel = useMemo(() => {
    return isInsufficientBalance
      ? "Insufficient balance"
      : isSwapping
      ? "Swapping..."
      : "Swap";
  }, [isInsufficientBalance, isSwapping]);

  const buttonVariant = useMemo(() => {
    return isInsufficientBalance
      ? "disabled"
      : isSwapping
      ? "ternary"
      : validSwap
      ? "primary"
      : "disabled";
  }, [isInsufficientBalance, isSwapping, validSwap]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  useEffect(() => {
    if (!garden) return;

    const handleErrorLog = (order: MatchedOrder, error: string) => {
      console.error("garden error", order.create_order.create_id, error);
    };
    const handleLog = (orderId: string, log: string) => {
      console.log("garden log", orderId, log);
    };
    const handleSuccess = (order: MatchedOrder) => {
      const { source_swap, destination_swap } = order;
      const inputAsset =
        assets &&
        assets[`${source_swap.chain}_${source_swap.asset.toLowerCase()}`];
      const outputAsset =
        assets &&
        assets[
          `${destination_swap.chain}_${destination_swap.asset.toLowerCase()}`
        ];
      if (!inputAsset || !outputAsset) return;

      const inputAmount = formatAmount(
        order.source_swap.amount,
        inputAsset.decimals
      );
      const outputAmount = formatAmount(
        order.destination_swap.amount,
        outputAsset.decimals
      );
      console.log("success order ✅", order.create_order.create_id);
      Toast.success(
        `Swap success ${inputAmount} ${inputAsset.symbol} to ${outputAmount} ${outputAsset.symbol}`
      );
    };

    garden.on("error", handleErrorLog);
    garden.on("log", handleLog);
    garden.on("success", handleSuccess);

    return () => {
      garden.off("error", handleErrorLog);
      garden.off("log", handleLog);
      garden.off("success", handleSuccess);
    };
  }, [garden, assets]);

  return (
    <div
      className={`before:content-[''] before:bg-black before:bg-opacity-0
          before:absolute before:top-0 before:left-0
          before:h-full before:w-full
          before:pointer-events-none before:transition-colors before:duration-700
          `}
    >
      {/* <AssetSelector /> */}
      <div className="flex flex-col gap-4 p-3">
        <div className="relative flex flex-col gap-4">
          <SwapInput
            type={IOType.input}
            amount={inputAmount}
            asset={inputAsset}
            onChange={handleInputAmountChange}
            loading={loading.input}
            price={tokenPrices.input}
            error={error}
            balance={inputTokenBalance}
          />
          <div
            className="absolute bg-white border border-light-grey rounded-full
            -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 transition-transform hover:scale-[1.1]
            p-1.5 cursor-pointer"
            onClick={swapAssets}
          >
            <ExchangeIcon />
          </div>
          <SwapInput
            type={IOType.output}
            amount={outputAmount}
            asset={outputAsset}
            onChange={handleOutputAmountChange}
            loading={loading.output}
            price={tokenPrices.output}
            timeEstimate={timeEstimate}
          />
        </div>
        <SwapAddress isValidAddress={isValidBitcoinAddress} />
        <SwapFees tokenPrices={tokenPrices} />
        <Button
          className={`transition-colors duration-500 ${
            isSwapping ? "cursor-not-allowed" : ""
          }`}
          variant={buttonVariant}
          size="lg"
          onClick={handleSwapClick}
          disabled={isSwapping || !validSwap || isInsufficientBalance}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
