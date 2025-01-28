import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { swapStore } from "../../store/swapStore";
import { useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { SwapCreateDetails } from "./SwapCreateDetails";

export const CreateSwap = () => {
  const { error, swapAssets, setAddressEditing } = swapStore();
  const {
    outputAmount,
    inputAmount,
    inputAsset,
    outputAsset,
    handleInputAmountChange,
    handleOutputAmountChange,
    loading,
    tokenPrices,
    validSwap,
    inputTokenBalance,
    isInsufficientBalance,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
  } = useSwap();
  const { inputAddressEditing, outputAddressEditing } = swapStore();
  const { account: btcAddress } = useBitcoinWallet();

  const isAnimating = loading.output || loading.input;
  const isDisabled =
    isSwapping ||
    !validSwap ||
    isInsufficientBalance ||
    isAnimating ||
    !!error.quoteError;

  const buttonLabel = useMemo(() => {
    return error.quoteError
      ? "Insufficient Liquidity"
      : isInsufficientBalance
      ? "Insufficient balance"
      : isSwapping
      ? "Signing..."
      : "Swap";
  }, [isInsufficientBalance, isSwapping, error.quoteError]);

  const buttonVariant = useMemo(() => {
    return isAnimating || error.quoteError || isInsufficientBalance
      ? "disabled"
      : isSwapping
      ? "ternary"
      : validSwap
      ? "primary"
      : "disabled";
  }, [isInsufficientBalance, isSwapping, validSwap, error, isAnimating]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const handleAssetSwap = () => {
    if (inputAddressEditing || outputAddressEditing) {
      setAddressEditing(IOType.input, !inputAddressEditing);
      setAddressEditing(IOType.output, !outputAddressEditing);
    }
    swapAssets();
  };

  return (
    <div
      className={`before:content-[''] before:bg-black before:bg-opacity-0
          before:absolute before:top-0 before:left-0
          before:h-full before:w-full
          before:pointer-events-none before:transition-colors before:duration-700
          `}
    >
      <div className="flex flex-col p-3">
        <div className="relative flex flex-col gap-4 mb-4">
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
            className={`absolute bg-white border border-light-grey rounded-full
            -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 transition-transform hover:scale-[1.1]
            p-1.5 cursor-pointer`}
            onClick={handleAssetSwap}
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
          className={`flex flex-col transition-all opacity-0 duration-700 ease-in-out ${
            inputAsset &&
            outputAsset &&
            ((inputAmount && Number(inputAmount) !== 0) ||
              (outputAmount && Number(outputAmount) !== 0))
              ? "max-h-[500px] opacity-100 pointer-events-auto"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`transition-all opacity-0 duration-500 overflow-hidden ease-in-out ${
              inputAddressEditing || outputAddressEditing || !btcAddress
                ? "max-h-[120px] opacity-100 pointer-events-auto"
                : "max-h-0 opacity-0 pointer-events-none"
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
