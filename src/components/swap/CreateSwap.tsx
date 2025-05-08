import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { BTC, swapStore } from "../../store/swapStore";
import { useEffect, useMemo, useState } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useSearchParams } from "react-router-dom";
import { assetInfoStore } from "../../store/assetInfoStore";
import { Errors } from "../../constants/errors";
import { isBitcoin } from "@gardenfi/orderbook";
import { modalNames, modalStore } from "../../store/modalStore";
import { getAssetFromChainAndSymbol, getQueryParams } from "../../utils/utils";
import { QUERY_PARAMS } from "../../constants/constants";
import SwapDetails from "./SwapDetails";

export const CreateSwap = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [addParams, setAddParams] = useState(false);

  const { swapAssets, setAsset, clearSwapState } = swapStore();
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
    isEditBTCAddress,
    isApproving,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
    needsWalletConnection,
    controller,
  } = useSwap();
  const { account: btcAddress } = useBitcoinWallet();
  const { setOpenModal } = modalStore();

  const buttonLabel = useMemo(() => {
    return error.swapError === Errors.insufficientLiquidity
      ? "Insufficient liquidity"
      : needsWalletConnection
        ? `Connect ${needsWalletConnection === "starknet" ? "Starknet" : "EVM"} Wallet`
        : error.swapError === Errors.insufficientBalance
          ? "Insufficient balance"
          : isApproving
            ? "Approving..."
            : isSwapping
              ? "Signing..."
              : "Swap";
  }, [error.swapError, isApproving, isSwapping, needsWalletConnection]);

  const buttonVariant = useMemo(() => {
    return needsWalletConnection
      ? "primary"
      : error.swapError === Errors.insufficientLiquidity ||
          error.swapError === Errors.insufficientBalance
        ? "disabled"
        : isSwapping
          ? "ternary"
          : validSwap
            ? "primary"
            : "disabled";
  }, [isSwapping, validSwap, error.swapError, needsWalletConnection]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const shouldShowDetails = useMemo(() => {
    return !!(
      inputAsset &&
      outputAsset &&
      !error.inputError &&
      !error.outputError &&
      error.swapError !== Errors.insufficientLiquidity &&
      inputAmount &&
      outputAmount &&
      Number(inputAmount) !== 0 &&
      Number(outputAmount) !== 0
    );
  }, [
    inputAsset,
    outputAsset,
    error.inputError,
    error.outputError,
    error.swapError,
    inputAmount,
    outputAmount,
  ]);

  const shouldShowAddress = useMemo(() => {
    return (
      (isEditBTCAddress || !btcAddress) &&
      ((inputAsset?.chain && isBitcoin(inputAsset.chain)) ||
        (outputAsset?.chain && isBitcoin(outputAsset.chain)))
    );
  }, [isEditBTCAddress, btcAddress, inputAsset, outputAsset]);

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

  useEffect(() => {
    if (!assets || addParams) return;
    const {
      inputChain = "",
      inputAssetSymbol = "",
      outputChain = "",
      outputAssetSymbol = "",
    } = getQueryParams(searchParams);

    const fromAsset = getAssetFromChainAndSymbol(
      assets,
      inputChain,
      inputAssetSymbol
    );
    const toAsset = getAssetFromChainAndSymbol(
      assets,
      outputChain,
      outputAssetSymbol
    );

    setAsset(IOType.input, fromAsset);
    setAsset(IOType.output, toAsset);
    if (!fromAsset && !toAsset) setAsset(IOType.input, BTC);
    setAddParams(true);
  }, [addParams, assets, inputAsset, outputAsset, searchParams, setAsset]);

  useEffect(() => {
    if (!addParams || (!inputAsset && !outputAsset)) return;

    setSearchParams((prev) => {
      prev.delete(QUERY_PARAMS.inputChain);
      prev.delete(QUERY_PARAMS.inputAsset);
      prev.delete(QUERY_PARAMS.outputChain);
      prev.delete(QUERY_PARAMS.outputAsset);

      if (inputAsset) {
        prev.set(QUERY_PARAMS.inputChain, inputAsset.chain);
        prev.set(QUERY_PARAMS.inputAsset, inputAsset.symbol);
      }
      if (outputAsset) {
        prev.set(QUERY_PARAMS.outputChain, outputAsset.chain);
        prev.set(QUERY_PARAMS.outputAsset, outputAsset.symbol);
      }

      return prev;
    });
  }, [addParams, inputAsset, outputAsset, setSearchParams]);

  // Cleanup: Abort any pending requests and clear swap state when component unmounts
  useEffect(() => {
    const currentController = controller.current;
    return () => {
      if (currentController) {
        currentController.abort();
      }
      clearSwapState();
    };
  }, [clearSwapState, controller]);

  return (
    <div
      className={`before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-black before:bg-opacity-0 before:transition-colors before:duration-700 before:content-['']`}
    >
      <div className="flex flex-col px-2 pb-3 pt-2 sm:px-3 sm:pb-4 sm:pt-3">
        <div className="relative flex flex-col gap-3">
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
        <SwapDetails
          shouldShowDetails={shouldShowDetails}
          shouldShowAddress={!!shouldShowAddress}
          isValidBitcoinAddress={isValidBitcoinAddress}
          tokenPrices={tokenPrices}
        />
        <Button
          className={`mt-3 transition-colors duration-500 ${
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
            (!needsWalletConnection && (!validSwap || !!error.swapError))
          }
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
