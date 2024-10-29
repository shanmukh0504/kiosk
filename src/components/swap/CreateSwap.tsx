import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { swapStore } from "../../store/swapStore";
import { assetInfoStore } from "../../store/assetInfoStore";
import { AssetSelector } from "./AssetSelector";
import { useGarden } from "@gardenfi/react-hooks";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { isBitcoin } from "@gardenfi/orderbook";
import { Toast } from "../toast/Toast";
// import { constructOrderPair } from "@gardenfi/core";
import { generateTokenKey } from "../../utils/generateTokenKey";
import { formatAmount } from "../../utils/utils";
import { useSwap } from "../../hooks/useSwap";

export const CreateSwap = () => {
  const [isSwapping, setIsSwapping] = useState(false);
  const { isAssetSelectorOpen, assets } = assetInfoStore();
  const { btcAddress, swapAssets, setShowConfirmSwap, clearAmounts } =
    swapStore();
  const {
    outputAmount,
    inputAmount,
    inputAsset,
    outputAsset,
    handleInputAmountChange,
    handleOutputAmountChange,
    loading,
    strategy,
    error,
    tokenPrices,
    validSwap,
    isBitcoinSwap,
  } = useSwap();
  const { swap, garden } = useGarden();

  const handleSwapClick = async () => {
    if (!validSwap || !swap || !inputAsset || !outputAsset || !strategy) return;
    setIsSwapping(true);

    const inputAmountInDecimals = new BigNumber(inputAmount)
      .multipliedBy(10 ** inputAsset.decimals)
      .toFixed();
    const outputAmountInDecimals = new BigNumber(outputAmount)
      .multipliedBy(10 ** outputAsset.decimals)
      .toFixed();

    const additionalData = isBitcoinSwap
      ? {
          strategyId: strategy,
          btcAddress,
        }
      : {
          strategyId: strategy,
        };

    const res = await swap({
      fromAsset: inputAsset,
      toAsset: outputAsset,
      sendAmount: inputAmountInDecimals,
      receiveAmount: outputAmountInDecimals,
      additionalData,
    });
    setIsSwapping(false);
    if (res.error) {
      console.error("failed to create order ❌", res.error);
      return;
    }

    //TODO: add a notification here and clear all amounts and addresses
    console.log("orderCreated ✅", res.val);
    clearAmounts();

    if (isBitcoin(res.val.source_swap.chain)) {
      setShowConfirmSwap({
        isOpen: true,
        order: res.val,
      });
    }
  };

  useEffect(() => {
    if (!garden) return;
    garden.on("error", (order, error) => {
      console.error("garden error", order.create_order.create_id, error);
    });
    garden.on("log", (orderId, log) => {
      console.log("garden log", orderId, log);
    });
    garden.on("success", (order) => {
      if (!assets) return;
      const inputAsset =
        assets[
          generateTokenKey(order.source_swap.chain, order.source_swap.asset)
        ];
      const outputAsset =
        assets[
          generateTokenKey(
            order.destination_swap.chain,
            order.destination_swap.asset
          )
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

      Toast.success(
        `Swap success ${inputAmount} ${inputAsset.symbol} to ${outputAmount} ${outputAsset.symbol}`
      );
    });
    //TODO: add cleanup function here
  }, [garden, assets]);

  return (
    <div
      className={`before:content-[''] before:bg-black before:bg-opacity-0
          before:absolute before:top-0 before:left-0
          before:h-full before:w-full
          before:pointer-events-none before:transition-colors before:duration-700
          ${isAssetSelectorOpen.isOpen && "before:bg-opacity-10"}`}
    >
      <AssetSelector />
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
          />
        </div>
        <SwapAddress />
        <Button
          className={`transition-colors duration-500 ${
            isSwapping ? "cursor-not-allowed" : ""
          }`}
          variant={isSwapping ? "ternary" : validSwap ? "primary" : "disabled"}
          size="lg"
          onClick={handleSwapClick}
        >
          {isSwapping ? "Swapping..." : "Swap"}
        </Button>
      </div>
    </div>
  );
};
