import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { BTC } from "../../store/swapStore";
import { useEffect, useMemo, useState } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useSearchParams } from "react-router-dom";
import { assetInfoStore } from "../../store/assetInfoStore";
import { modalNames, modalStore } from "../../store/modalStore";
import { getAssetFromChainAndSymbol, getQueryParams } from "../../utils/utils";
import { QUERY_PARAMS } from "../../constants/constants";
import { InputAddressAndFeeRateDetails } from "./InputAddressAndFeeRateDetails";

export const CreateSwap = () => {
  const [loadingDisabled, setLoadingDisabled] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [addParams, setAddParams] = useState(false);
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
    isApproving,
    isSwapping,
    handleSwapClick,
    needsWalletConnection,
    controller,
    setAsset,
    clearSwapState,
    swapAssets,
  } = useSwap();
  const { setOpenModal } = modalStore();

  const buttonLabel = useMemo(() => {
    return error.liquidityError
      ? "Insufficient liquidity"
      : needsWalletConnection
        ? `Connect ${needsWalletConnection === "starknet" ? "Starknet" : "EVM"} Wallet`
        : error.insufficientBalanceError
          ? "Insufficient balance"
          : isApproving
            ? "Approving..."
            : isSwapping
              ? "Signing"
              : "Swap";
  }, [
    error.liquidityError,
    isApproving,
    isSwapping,
    needsWalletConnection,
    error.insufficientBalanceError,
  ]);

  const buttonVariant = useMemo(() => {
    return needsWalletConnection
      ? "primary"
      : !!error.liquidityError ||
          !!error.insufficientBalanceError ||
          loadingDisabled
        ? "disabled"
        : isSwapping
          ? "ternary"
          : validSwap
            ? "primary"
            : "disabled";
  }, [
    isSwapping,
    validSwap,
    error.liquidityError,
    error.insufficientBalanceError,
    needsWalletConnection,
    loadingDisabled,
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

  // Disable button when loading
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (loading.input || loading.output) {
      timeoutId = setTimeout(() => {
        setLoadingDisabled(true);
      }, 300);
    } else {
      setLoadingDisabled(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

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
            className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            onClick={swapAssets}
          >
            <div className="h-8 w-8 origin-center rounded-full border border-light-grey bg-white p-1.5 transition-transform group-hover:scale-[1.1]"></div>
            <ExchangeIcon className="pointer-events-none absolute bottom-1.5 left-1.5" />
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
        <InputAddressAndFeeRateDetails />
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
            loadingDisabled ||
            isSwapping ||
            (!needsWalletConnection &&
              (!validSwap ||
                !!error.liquidityError ||
                !!error.insufficientBalanceError))
          }
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
