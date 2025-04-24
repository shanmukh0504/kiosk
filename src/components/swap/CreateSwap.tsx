import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { swapStore } from "../../store/swapStore";
import { useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { SwapFees } from "./SwapFees";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { modalNames, modalStore } from "../../store/modalStore";

export const CreateSwap = () => {
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
    isApproving,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
    needsWalletConnection,
  } = useSwap();
  const { account: btcAddress } = useBitcoinWallet();
  const { setOpenModal } = modalStore();

  const buttonLabel = useMemo(() => {
    if (needsWalletConnection) {
      return `Connect ${needsWalletConnection === "starknet" ? "Starknet" : "EVM"} Wallet`;
    }
    return isInsufficientBalance
      ? "Insufficient balance"
      : isApproving
        ? "Approving..."
        : isSwapping
          ? "Signing..."
          : error.quoteError
            ? "Insufficient Liquidity"
            : "Swap";
  }, [
    isInsufficientBalance,
    isApproving,
    isSwapping,
    error.quoteError,
    needsWalletConnection,
  ]);

  const buttonVariant = useMemo(() => {
    if (needsWalletConnection) return "primary";
    return isInsufficientBalance || error.quoteError
      ? "disabled"
      : isSwapping
        ? "ternary"
        : validSwap
          ? "primary"
          : "disabled";
  }, [
    isInsufficientBalance,
    isSwapping,
    validSwap,
    error.quoteError,
    needsWalletConnection,
  ]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const handleConnectWallet = () => {
    if (needsWalletConnection === "starknet") {
      setOpenModal(modalNames.connectWallet, {
        Starknet: true,
        Bitcoin: false,
        EVM: false,
      });
    }
    if (needsWalletConnection === "evm") {
      setOpenModal(modalNames.connectWallet, {
        EVM: true,
        Starknet: false,
        Bitcoin: false,
      });
    }
  };

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
            !needsWalletConnection && buttonLabel !== "Swap"
              ? "pointer-events-none"
              : ""
          }`}
          variant={buttonVariant}
          size="lg"
          onClick={
            needsWalletConnection ? handleConnectWallet : handleSwapClick
          }
          disabled={
            isSwapping ||
            (!needsWalletConnection &&
              (!validSwap || isInsufficientBalance || !!error.quoteError))
          }
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
