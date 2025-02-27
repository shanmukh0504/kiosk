import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { BTC, swapStore } from "../../store/swapStore";
import { useEffect, useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { SwapFees } from "./SwapFees";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { getQueryParams } from "../../utils/utils";
import { useSearchParams } from "react-router-dom";
import { assetInfoStore } from "../../store/assetInfoStore";

export const CreateSwap = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { swapAssets, setAsset } = swapStore();
  const { assets } = assetInfoStore();

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
  const { account: btcAddress } = useBitcoinWallet();

  const buttonLabel = useMemo(() => {
    return isInsufficientBalance
      ? "Insufficient balance"
      : isSwapping
        ? "Signing..."
        : error.quoteError
          ? "Insufficient Liquidity"
          : "Swap";
  }, [isInsufficientBalance, isSwapping, error.quoteError]);

  const buttonVariant = useMemo(() => {
    return isInsufficientBalance || error.quoteError
      ? "disabled"
      : isSwapping
        ? "ternary"
        : validSwap
          ? "primary"
          : "disabled";
  }, [isInsufficientBalance, isSwapping, validSwap, error.quoteError]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  useEffect(() => {
    if (!assets) return;

    const {
      inputChain = "",
      inputAsset = "",
      outputChain = "",
      outputAsset = "",
    } = getQueryParams(searchParams);

    const fromAsset = assets[`${inputChain}_${inputAsset?.toLowerCase()}`];
    const toAsset = assets[`${outputChain}_${outputAsset?.toLowerCase()}`];

    if (fromAsset) {
      setAsset(IOType.input, fromAsset);
    } else {
      if (!inputAsset) {
          setAsset(IOType.input, BTC);
      }
    }
    if (toAsset) {
      setAsset(IOType.output, toAsset);
    }
  }, [assets, searchParams, setAsset]);

  useEffect(() => {
    if (!inputAsset || !outputAsset) return;

    setSearchParams({
      inputChain: inputAsset.chain,
      inputAsset: inputAsset.atomicSwapAddress,
      outputChain: outputAsset.chain,
      outputAsset: outputAsset.atomicSwapAddress,
    });
  }, [inputAsset, outputAsset, setSearchParams]);

  return (
    <div
      className={`before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-black before:bg-opacity-0 before:transition-colors before:duration-700 before:content-['']`}
    >
      <div className="flex flex-col gap-4 p-3">
        <div className="relative flex flex-col gap-4">
          <SwapInput
            type={IOType.input}
            amount={inputAmount}
            asset={inputAsset}
            onChange={handleInputAmountChange}
            loading={loading.input}
            price={tokenPrices.input}
            error={error.inputError}
            balance={inputTokenBalance}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-light-grey bg-white p-1.5 transition-transform hover:scale-[1.1]"
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
        {!btcAddress && <SwapAddress isValidAddress={isValidBitcoinAddress} />}
        <SwapFees tokenPrices={tokenPrices} />
        <Button
          className={`transition-colors duration-500 ${
            buttonLabel !== "Swap" ? "pointer-events-none" : ""
          }`}
          variant={buttonVariant}
          size="lg"
          onClick={handleSwapClick}
          disabled={
            isSwapping ||
            !validSwap ||
            isInsufficientBalance ||
            !!error.quoteError
          }
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
