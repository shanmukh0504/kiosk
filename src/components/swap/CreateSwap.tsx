import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { useMemo, useState } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { SwapCreateDetails } from "./SwapCreateDetails";

export const CreateSwap = () => {
  const {
    outputAmount,
    inputAmount,
    inputAsset,
    outputAsset,
    handleInputAmountChange,
    handleOutputAmountChange,
    handleAssetSwap,
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

  const [isEditing, setIsEditing] = useState(false)

  const buttonLabel = useMemo(() => {
    return isInsufficientBalance
      ? "Insufficient balance"
      : isSwapping
        ? "Signing..."
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
            error={error}
            balance={inputTokenBalance}
          />
          <div
            className="absolute bg-white border border-light-grey rounded-full
            -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 transition-transform hover:scale-[1.1]
            p-1.5 cursor-pointer"
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
            price={tokenPrices.output}
            timeEstimate={timeEstimate}
          />
        </div>
        <div className={`flex flex-col transition-all opacity-0 duration-700 ease-in-out ${inputAsset && outputAsset && ((inputAmount && Number(inputAmount) !== 0) || (outputAmount && Number(outputAmount) !== 0)) ? 'max-h-[500px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className={`transition-all opacity-0 duration-500 overflow-hidden ease-in-out ${(isEditing || !btcAddress) ? 'max-h-[120px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <SwapAddress isValidAddress={isValidBitcoinAddress} />
          </div>
          <SwapCreateDetails tokenPrices={tokenPrices} setIsEditing={setIsEditing} isEditing={isEditing} inputChain={inputAsset?.chain} outputChain={outputAsset?.chain} />
        </div>

        <Button
          className={`transition-colors duration-500 z-20 ${isSwapping ? "cursor-not-allowed" : ""}`}
          variant={buttonVariant}
          size="lg"
          onClick={handleSwapClick}
          disabled={isSwapping || !validSwap || isInsufficientBalance}
        >
          {buttonLabel}
        </Button>
      </div>
    </div >
  );
};
