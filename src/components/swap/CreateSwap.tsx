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

export const CreateSwap = () => {
  const [strategy, setStrategy] = useState<string>();
  const [isSwapping, setIsSwapping] = useState(false);
  const { isAssetSelectorOpen } = assetInfoStore();
  const {
    btcAddress,
    inputAmount,
    outputAmount,
    inputAsset,
    setAmount,
    swapAssets,
    outputAsset,
    setShowConfirmSwap,
  } = swapStore();
  const { swap, getQuote, initializeSecretManager, garden } = useGarden();

  const handleInputAmountChange = async (amount: string) => {
    setAmount(IOType.input, amount);

    if (!getQuote || !inputAsset || !outputAsset || !Number(amount)) return;

    const amountInDecimals = new BigNumber(amount).multipliedBy(
      10 ** inputAsset.decimals,
    );
    const quote = await getQuote({
      fromAsset: inputAsset,
      toAsset: outputAsset,
      amount: amountInDecimals.toNumber(),
      isExactOut: false,
    });
    if (quote.error) {
      setAmount(IOType.output, "0");
      return;
    }

    const [strategy, quoteAmount] = Object.entries(quote.val.quotes)[0];
    setStrategy(strategy);
    const quoteAmountInDecimals = new BigNumber(quoteAmount).div(
      Math.pow(10, outputAsset.decimals),
    );

    setAmount(IOType.output, quoteAmountInDecimals.toFixed(8));
  };

  const handleOutputAmountChange = async (amount: string) => {
    setAmount(IOType.output, amount);

    if (!getQuote || !inputAsset || !outputAsset || !Number(amount)) return;

    const amountInDecimals = new BigNumber(amount).multipliedBy(
      10 ** inputAsset.decimals,
    );
    const quote = await getQuote({
      fromAsset: inputAsset,
      toAsset: outputAsset,
      amount: amountInDecimals.toNumber(),
      isExactOut: true,
    });
    if (quote.error) {
      setAmount(IOType.input, "0");
      return;
    }

    const [strategy, quoteAmount] = Object.entries(quote.val.quotes)[0];
    setStrategy(strategy);
    const quoteAmountInDecimals = new BigNumber(quoteAmount).div(
      Math.pow(10, inputAsset.decimals),
    );

    setAmount(IOType.input, quoteAmountInDecimals.toFixed(8));
  };

  const handleSwapClick = async () => {
    if (
      !validSwap ||
      !swap ||
      !inputAsset ||
      !outputAsset ||
      !strategy ||
      !initializeSecretManager
    )
      return;
    setIsSwapping(true);

    const inputAmountInDecimals = new BigNumber(inputAmount)
      .multipliedBy(10 ** inputAsset.decimals)
      .toString();
    const outputAmountInDecimals = new BigNumber(outputAmount)
      .multipliedBy(10 ** outputAsset.decimals)
      .toString();

    const res = await swap({
      fromAsset: inputAsset,
      toAsset: outputAsset,
      sendAmount: inputAmountInDecimals,
      receiveAmount: outputAmountInDecimals,
      additionalData: {
        strategyId: strategy,
        btcAddress,
      },
    });
    setIsSwapping(false);
    if (res.error) {
      console.error("failed to create order ❌", res.error);
      return;
    }

    console.log("orderCreated ✅", res.val);

    if (isBitcoin(res.val.source_swap.chain)) {
      setShowConfirmSwap({
        isOpen: true,
        order: res.val,
      });
    }
  };

  const _validSwap = inputAsset && outputAmount && inputAmount && outputAmount;
  const validSwap =
    inputAsset &&
    outputAsset &&
    (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain))
      ? _validSwap && btcAddress
      : _validSwap;

  useEffect(() => {
    if (!garden) return;
    garden.on("error", (order, error) => {
      console.error("error", order.create_order.create_id, error);
    });
  }, []);

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
        <SwapInput
          type={IOType.input}
          amount={inputAmount}
          asset={inputAsset}
          onChange={handleInputAmountChange}
        />
        <div
          //TODO: fix the y position of the ExchangeIcon
          className="absolute bg-white border border-light-grey rounded-full
          left-1/2 -translate-x-1/2 top-[88px]
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
        />
        <SwapAddress />
        <Button
          className="transition-colors duration-500"
          variant={isSwapping ? "ternary" : validSwap ? "primary" : "disabled"}
          size="lg"
          onClick={handleSwapClick}
        >
          {isSwapping ? "Swapping" : "Swap"}
        </Button>
      </div>
    </div>
  );
};
