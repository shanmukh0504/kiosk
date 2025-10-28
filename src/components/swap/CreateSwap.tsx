import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import {
  getTimeEstimates,
  IOType,
  WALLET_SUPPORTED_CHAINS,
  QUERY_PARAMS,
} from "../../constants/constants";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { assetInfoStore } from "../../store/assetInfoStore";
import { modalNames, modalStore } from "../../store/modalStore";
import { balanceStore } from "../../store/balanceStore";
import {
  capitalizeChain,
  getAssetFromChainAndSymbol,
  getFirstAssetFromChain,
  getQueryParams,
} from "../../utils/utils";
import { ecosystems } from "../navbar/connectWallet/constants";
import { InputAddressAndFeeRateDetails } from "./InputAddressAndFeeRateDetails";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { useSuiWallet } from "../../hooks/useSuiWallet";
import {
  isEVM,
  isBitcoin,
  isStarknet,
  isSolana,
  isSui,
  isTron,
  Chain,
  BlockchainType,
} from "@gardenfi/orderbook";
import { swapStore } from "../../store/swapStore";
import { AnimatePresence, motion } from "framer-motion";
import { CompetitorComparisons } from "./CompetitorComparisons";
import { useTronWallet } from "../../hooks/useTronWallet";

export const CreateSwap = () => {
  const [loadingDisabled, setLoadingDisabled] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [addParams, setAddParams] = useState(false);

  const navigate = useNavigate();
  const { destinationChain } = useParams();
  const { account: btcAddress, provider } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAnchorProvider } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();
  const { tronAddress } = useTronWallet();
  const { isAssetSelectorOpen, assets, fetchAndSetFiatValues } =
    assetInfoStore();
  const {
    fetchAndSetBitcoinBalance,
    fetchAndSetEvmBalances,
    fetchAndSetStarknetBalance,
    fetchAndSetSolanaBalance,
    fetchAndSetSuiBalance,
    fetchAndSetTronBalance,
  } = balanceStore();
  const {
    isComparisonVisible,
    showComparison,
    hideComparison,
    updateComparisonSavings,
  } = swapStore();

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
  const { connector } = useEVMWallet();

  const isChainSupported = useMemo(() => {
    if (!connector || !inputAsset || !outputAsset) return true;
    if (!WALLET_SUPPORTED_CHAINS[connector.id]) return true;

    if (outputAsset.chain === "core") {
      return WALLET_SUPPORTED_CHAINS[connector.id].includes(outputAsset.chain);
    }

    if (
      isBitcoin(inputAsset.chain) ||
      isStarknet(inputAsset.chain) ||
      isSolana(inputAsset.chain) ||
      isSui(inputAsset.chain)
    )
      return true;
    return WALLET_SUPPORTED_CHAINS[connector.id].includes(inputAsset.chain);
  }, [connector, inputAsset, outputAsset]);

  const buttonLabel = useMemo(() => {
    if (needsWalletConnection)
      return `Connect ${capitalizeChain(needsWalletConnection)} Wallet`;

    return error.liquidityError
      ? "Insufficient liquidity"
      : !isChainSupported
        ? "Wallet does not support the chain"
        : error.insufficientBalanceError
          ? "Insufficient balance"
          : needsWalletConnection
            ? `Connect ${capitalizeChain(needsWalletConnection)} Wallet`
            : isApproving
              ? "Approving..."
              : isSwapping
                ? "Signing"
                : "Swap";
  }, [
    isChainSupported,
    error.liquidityError,
    isApproving,
    isSwapping,
    needsWalletConnection,
    error.insufficientBalanceError,
  ]);

  const buttonDisabled = useMemo(() => {
    return error.liquidityError
      ? true
      : needsWalletConnection
        ? false
        : !isChainSupported || isSwapping
          ? true
          : validSwap
            ? false
            : true;
  }, [
    isChainSupported,
    isSwapping,
    validSwap,
    error.liquidityError,
    needsWalletConnection,
  ]);

  const buttonVariant = useMemo(() => {
    return buttonDisabled
      ? "disabled"
      : isSwapping
        ? "ternary"
        : needsWalletConnection || validSwap
          ? "primary"
          : "disabled";
  }, [buttonDisabled, isSwapping, validSwap, needsWalletConnection]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const fetchAllBalances = useCallback(async () => {
    await fetchAndSetFiatValues();
    await Promise.allSettled([
      address && fetchAndSetEvmBalances(address),
      btcAddress && provider && fetchAndSetBitcoinBalance(provider, btcAddress),
      starknetAddress && fetchAndSetStarknetBalance(starknetAddress),
      solanaAnchorProvider &&
        fetchAndSetSolanaBalance(solanaAnchorProvider.publicKey),
      currentAccount && fetchAndSetSuiBalance(currentAccount.address),
      tronAddress && fetchAndSetTronBalance(tronAddress),
    ]);
  }, [
    address,
    provider,
    btcAddress,
    currentAccount,
    fetchAndSetEvmBalances,
    fetchAndSetBitcoinBalance,
    fetchAndSetSuiBalance,
    starknetAddress,
    solanaAnchorProvider,
    fetchAndSetFiatValues,
    fetchAndSetStarknetBalance,
    fetchAndSetSolanaBalance,
    fetchAndSetTronBalance,
    tronAddress,
  ]);

  const fetchInputAssetBalance = useCallback(async () => {
    if (!inputAsset) return;
    await fetchAndSetFiatValues();
    if (isEVM(inputAsset.chain) && address)
      await fetchAndSetEvmBalances(address, inputAsset);
    if (isBitcoin(inputAsset.chain) && provider && btcAddress)
      await fetchAndSetBitcoinBalance(provider, btcAddress);
    if (isStarknet(inputAsset.chain) && starknetAddress)
      await fetchAndSetStarknetBalance(starknetAddress);
    if (isSolana(inputAsset.chain) && solanaAnchorProvider)
      await fetchAndSetSolanaBalance(solanaAnchorProvider.publicKey);
    if (isSui(inputAsset.chain) && currentAccount)
      await fetchAndSetSuiBalance(currentAccount.address);
    if (isTron(inputAsset.chain) && tronAddress)
      await fetchAndSetTronBalance(tronAddress);
  }, [
    fetchAndSetFiatValues,
    inputAsset,
    address,
    fetchAndSetEvmBalances,
    provider,
    btcAddress,
    fetchAndSetBitcoinBalance,
    starknetAddress,
    fetchAndSetStarknetBalance,
    solanaAnchorProvider,
    fetchAndSetSolanaBalance,
    currentAccount,
    fetchAndSetSuiBalance,
    tronAddress,
    fetchAndSetTronBalance,
  ]);

  const handleConnectWallet = () => {
    if (!needsWalletConnection) return;

    const modalState = Object.entries(ecosystems).reduce(
      (acc, [key, { name }]) => {
        acc[key as BlockchainType] =
          name.toLowerCase() === needsWalletConnection;
        return acc;
      },
      {} as Record<BlockchainType, boolean>
    );

    setOpenModal(modalNames.connectWallet, modalState);
  };

  useEffect(() => {
    if (!assets) return;
    fetchAllBalances();
  }, [assets, fetchAllBalances]);

  useEffect(() => {
    if (!assets) return;

    const interval = setInterval(() => {
      if (isAssetSelectorOpen.isOpen) {
        fetchAllBalances();
      } else {
        fetchInputAssetBalance();
      }
    }, 7000);

    return () => {
      clearInterval(interval);
    };
  }, [
    assets,
    isAssetSelectorOpen.isOpen,
    fetchAllBalances,
    fetchInputAssetBalance,
  ]);

  useEffect(() => {
    if (!assets || addParams) return;
    const {
      inputChain = "",
      inputAssetSymbol = "",
      outputChain = "",
      outputAssetSymbol = "",
      inputAmount: urlInputAmount = "",
    } = getQueryParams(searchParams);

    if (outputChain && !destinationChain) {
      navigate(`/bridge/${outputChain}?${searchParams.toString()}`);
      return;
    }

    if (outputChain && !outputAssetSymbol) {
      const outputChainAsset = getFirstAssetFromChain(assets, outputChain);
      if (outputChainAsset) {
        setAsset(IOType.output, outputChainAsset);
      }
    }

    const fromAsset = getAssetFromChainAndSymbol(
      assets,
      inputChain,
      inputAssetSymbol
    );

    const toAsset =
      (outputChain && outputAssetSymbol
        ? getAssetFromChainAndSymbol(assets, outputChain, outputAssetSymbol)
        : undefined) ||
      getAssetFromChainAndSymbol(
        assets,
        destinationChain || "",
        outputAssetSymbol
      ) ||
      (destinationChain && !outputAssetSymbol
        ? getFirstAssetFromChain(assets, destinationChain)
        : undefined);

    setAsset(IOType.output, toAsset);

    if (fromAsset) {
      setAsset(IOType.input, fromAsset);
    } else {
      if (!destinationChain || !isBitcoin(destinationChain as Chain)) {
        const BTC = Object.values(assets).find((asset) =>
          isBitcoin(asset.chain)
        );
        if (BTC && (!toAsset || !isBitcoin(toAsset.chain))) {
          setAsset(IOType.input, BTC);
        }
      } else {
        setAsset(IOType.input, undefined);
      }
    }

    if (urlInputAmount && urlInputAmount !== inputAmount) {
      handleInputAmountChange(urlInputAmount);
    }

    setAddParams(true);
  }, [
    addParams,
    assets,
    inputAsset,
    outputAsset,
    searchParams,
    setAsset,
    inputAmount,
    destinationChain,
    handleInputAmountChange,
    navigate,
  ]);

  useEffect(() => {
    if (!addParams || (!inputAsset && !outputAsset)) return;

    setSearchParams((prev) => {
      prev.delete(QUERY_PARAMS.inputChain);
      prev.delete(QUERY_PARAMS.inputAsset);
      prev.delete(QUERY_PARAMS.outputChain);
      prev.delete(QUERY_PARAMS.outputAsset);
      prev.delete(QUERY_PARAMS.inputAmount);

      if (inputAsset) {
        prev.set(QUERY_PARAMS.inputChain, inputAsset.chain);
        prev.set(QUERY_PARAMS.inputAsset, inputAsset.symbol);
      }

      if (inputAsset && outputAsset && inputAsset.chain === outputAsset.chain) {
        prev.delete(QUERY_PARAMS.inputChain);
        prev.delete(QUERY_PARAMS.inputAsset);
      }
      if (outputAsset) {
        prev.set(QUERY_PARAMS.outputAsset, outputAsset.symbol);
      } else {
        prev.delete(QUERY_PARAMS.outputAsset);
      }
      if (inputAmount) {
        prev.set(QUERY_PARAMS.inputAmount, inputAmount);
      }

      return prev;
    });

    if (outputAsset && outputAsset.chain !== destinationChain) {
      navigate(`/bridge/${outputAsset.chain}`);
    } else if (!outputAsset && destinationChain) {
      navigate("/");
    }
  }, [
    addParams,
    inputAsset,
    outputAsset,
    inputAmount,
    setSearchParams,
    navigate,
    destinationChain,
  ]);

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
    <div className="relative">
      <CompetitorComparisons
        hide={hideComparison}
        isTime={showComparison.isTime}
        isFees={showComparison.isFees}
        onComparisonUpdate={updateComparisonSavings}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key="create-swap"
          initial={{ opacity: 1 }}
          animate={{ opacity: isComparisonVisible ? 0 : 1 }}
          transition={{
            duration: isComparisonVisible ? 0.32 : 0.45,
            delay: isComparisonVisible ? 0 : 0.25,
            ease: "easeOut",
          }}
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
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                onClick={swapAssets}
              >
                <div className="h-8 w-8 origin-center rounded-full border border-light-grey bg-white p-1.5 transition-transform hover:scale-[1.1]"></div>
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
              className={`mt-3 transition-colors duration-500`}
              variant={buttonVariant}
              size="lg"
              disabled={buttonDisabled || loadingDisabled}
              onClick={
                needsWalletConnection ? handleConnectWallet : handleSwapClick
              }
            >
              {buttonLabel}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
