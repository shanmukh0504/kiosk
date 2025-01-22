import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { SwapCreateDetails } from "./SwapCreateDetails";
import { swapStore } from "../../store/swapStore";
import { Loader } from "../../common/Loader";

export const CreateSwap = () => {
  const { isInsufficientLiquidity } = swapStore();
  const {
    outputAmount,
    inputAmount,
    inputAsset,
    outputAsset,
    handleInputAmountChange,
    handleOutputAmountChange,
    handleAssetSwap,
    loading,
    inputError,
    outputError,
    tokenPrices,
    validSwap,
    inputTokenBalance,
    isInsufficientBalance,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
  } = useSwap();
  const { inputEditing, outputEditing } = swapStore();
  const { account: btcAddress } = useBitcoinWallet();

  const buttonLabel = useMemo(() => {
    return isInsufficientBalance
      ? "Insufficient balance"
      : isSwapping
      ? "Signing..."
      : isInsufficientLiquidity
      ? "Insufficient Liquidity"
      : "Swap";
  }, [isInsufficientBalance, isSwapping, isInsufficientLiquidity]);

  const buttonVariant = useMemo(() => {
    return isInsufficientBalance
      ? "disabled"
      : isSwapping
      ? "ternary"
      : isInsufficientLiquidity
      ? "disabled"
      : validSwap
      ? "primary"
      : "disabled";
  }, [isInsufficientBalance, isSwapping, validSwap, isInsufficientLiquidity]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const isAnimating = loading.output || loading.input;
  const isDisabled = useMemo(() => {
    return (
      isSwapping ||
      !validSwap ||
      isInsufficientBalance ||
      loading.output ||
      loading.input ||
      isInsufficientLiquidity
    );
  }, [
    isSwapping,
    validSwap,
    isInsufficientBalance,
    loading.output,
    loading.input,
    isInsufficientLiquidity,
  ]);

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
            error={inputError}
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
            error={outputError}
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
              inputEditing || outputEditing || !btcAddress
                ? "max-h-[120px] opacity-100 pointer-events-auto"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <SwapAddress isValidAddress={isValidBitcoinAddress} />
          </div>
          <SwapCreateDetails tokenPrices={tokenPrices} />
        </div>
        <Button
          className={`transition-colors relative duration-500 w-full z-20 flex justify-center items-center overflow-hidden ${
            isSwapping ? "cursor-not-allowed" : ""
          }`}
          variant={buttonVariant}
          size="lg"
          onClick={handleSwapClick}
          disabled={isDisabled}
        >
          <span>{buttonLabel}</span>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isAnimating ? "w-6 h-6 opacity-100" : "w-0 h-0 opacity-30"
            }`}
          >
            <Loader width={24} height={24} />
          </div>
        </Button>
      </div>
    </div>
  );
};
