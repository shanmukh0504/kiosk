import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { SwapCreateDetails } from "./SwapCreateDetails";
import { Errors } from "../../constants/errors";

export const CreateSwap = () => {
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
    isEditBTCAddress,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
    swapAssets,
  } = useSwap();
  const { account: btcAddress } = useBitcoinWallet();

  const isDisabled = isSwapping || !validSwap || !!error.swapError;

  const buttonLabel = useMemo(() => {
    return error.swapError === Errors.insufficientLiquidity
      ? "Insufficient Liquidity"
      : error.swapError === Errors.insufficientBalance
        ? "Insufficient balance"
        : isSwapping
          ? "Signing..."
          : "Swap";
  }, [error.swapError, isSwapping]);

  const buttonVariant = useMemo(() => {
    return error.swapError
      ? "disabled"
      : isSwapping
        ? "ternary"
        : validSwap
          ? "primary"
          : "disabled";
  }, [isSwapping, validSwap, error.swapError]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

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
            error={error.outputError}
            price={tokenPrices.output}
            timeEstimate={timeEstimate}
          />
        </div>
        <div
          className={`flex flex-col opacity-0 transition-all duration-700 ease-in-out ${
            inputAsset &&
            outputAsset &&
            ((inputAmount && Number(inputAmount) !== 0) ||
              (outputAmount && Number(outputAmount) !== 0))
              ? "pointer-events-auto max-h-[500px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div
            className={`overflow-hidden opacity-0 transition-all duration-500 ease-in-out ${
              isEditBTCAddress || !btcAddress
                ? "pointer-events-auto max-h-[120px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <SwapAddress isValidAddress={isValidBitcoinAddress} />
          </div>
          <SwapCreateDetails tokenPrices={tokenPrices} />
        </div>
        <Button
          className={`transition-colors duration-500${
            isSwapping ? "cursor-not-allowed" : ""
          }`}
          variant={buttonVariant}
          size="lg"
          onClick={handleSwapClick}
          disabled={isDisabled}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
