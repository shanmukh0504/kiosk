import { useCallback, useEffect, useMemo, useRef } from "react";
import { swapStore } from "../store/swapStore";
import { IOType, network } from "../constants/constants";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import debounce from "lodash.debounce";
import { assetInfoStore } from "../store/assetInfoStore";
import {
  constructOrderPair,
  OrderStatus,
  validateBTCAddress,
} from "@gardenfi/core";
import { useGarden } from "@gardenfi/react-hooks";
import { useStarknetWallet } from "./useStarknetWallet";
import { useEVMWallet } from "./useEVMWallet";
import { modalNames, modalStore } from "../store/modalStore";
import { isStarknet, isEVM } from "@gardenfi/orderbook";
import { useBalances } from "./useBalances";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { Environment } from "@gardenfi/utils";
import { Errors } from "../constants/errors";
import { ConnectingWalletStore } from "../store/connectWalletStore";
import orderInProgressStore from "../store/orderInProgressStore";
import pendingOrdersStore from "../store/pendingOrdersStore";
import BigNumber from "bignumber.js";

export const useSwap = () => {
  const {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    isSwapping,
    strategy,
    error,
    btcAddress,
    tokenPrices,
    isFetchingQuote,
    isEditBTCAddress,
    setStrategy,
    setIsSwapping,
    setAmount,
    setError,
    swapAssets,
    setIsFetchingQuote,
    setTokenPrices,
    clearSwapState,
    setBtcAddress,
    setIsEditBTCAddress,
  } = swapStore();
  const { tokenBalance: inputTokenBalance } = useBalances(inputAsset);
  const { strategies } = assetInfoStore();
  const { setOrder, setIsOpen } = orderInProgressStore();
  const { updateOrder } = pendingOrdersStore();
  const { address, disconnect } = useEVMWallet();
  const { swapAndInitiate, getQuote } = useGarden();
  const { provider, account } = useBitcoinWallet();
  const controller = useRef<AbortController | null>(null);
  const { setConnectingWallet } = ConnectingWalletStore();
  const { address: evmAddress } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { setOpenModal } = modalStore();
  const isInsufficientBalance = useMemo(
    () => new BigNumber(inputAmount).gt(inputTokenBalance),
    [inputAmount, inputTokenBalance]
  );

  const isBitcoinSwap = useMemo(() => {
    return !!(
      inputAsset &&
      outputAsset &&
      (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain))
    );
  }, [inputAsset, outputAsset]);
  const isValidBitcoinAddress = useMemo(() => {
    if (!isBitcoinSwap) return true;
    return btcAddress
      ? validateBTCAddress(btcAddress, network as unknown as Environment)
      : false;
  }, [btcAddress, isBitcoinSwap]);
  const _validSwap = useMemo(() => {
    return !!(
      inputAsset &&
      outputAmount &&
      inputAmount &&
      outputAsset &&
      strategy &&
      address &&
      isValidBitcoinAddress &&
      !error.inputError &&
      !error.outputError &&
      !error.swapError
    );
  }, [
    inputAsset,
    outputAmount,
    inputAmount,
    outputAsset,
    strategy,
    error,
    address,
    isValidBitcoinAddress,
  ]);

  const validSwap = useMemo(() => {
    return isBitcoinSwap ? !!(_validSwap && btcAddress) : _validSwap;
  }, [_validSwap, isBitcoinSwap, btcAddress]);

  const swapLimits = useMemo(() => {
    return (
      inputAsset &&
      outputAsset &&
      strategies.val &&
      strategies.val[
        constructOrderPair(
          inputAsset.chain,
          inputAsset.atomicSwapAddress,
          outputAsset.chain,
          outputAsset.atomicSwapAddress
        )
      ]
    );
  }, [inputAsset, outputAsset, strategies.val]);

  const minAmount = useMemo(() => {
    return swapLimits && inputAsset
      ? new BigNumber(swapLimits.minAmount)
          .dividedBy(10 ** inputAsset.decimals)
          .toNumber()
      : undefined;
  }, [swapLimits, inputAsset]);

  const maxAmount = useMemo(() => {
    return swapLimits && inputAsset
      ? new BigNumber(swapLimits.maxAmount)
          .dividedBy(10 ** inputAsset.decimals)
          .toNumber()
      : undefined;
  }, [swapLimits, inputAsset]);

  const debouncedFetchQuote = useMemo(
    () =>
      debounce(
        async (
          amount: string,
          fromAsset: Asset,
          toAsset: Asset,
          isExactOut: boolean
        ) => {
          if (!getQuote || isSwapping) return;

          setIsFetchingQuote({ input: isExactOut, output: !isExactOut });

          if (controller.current) controller.current.abort();
          controller.current = new AbortController();

          const decimals = isExactOut ? toAsset.decimals : fromAsset.decimals;
          const amountInDecimals = new BigNumber(amount).multipliedBy(
            10 ** decimals
          );
          const quote = await getQuote({
            fromAsset,
            toAsset,
            amount: amountInDecimals.toNumber(),
            isExactOut,
            request: {
              signal: controller.current.signal,
            },
          });
          if (!quote || quote.error) {
            if (quote?.error?.includes("AbortError")) {
              setError({ swapError: Errors.none });
              setIsFetchingQuote({ input: false, output: false });
              setStrategy("");
              return;
            } else if (quote?.error?.includes("insufficient liquidity")) {
              setError({ swapError: Errors.insufficientLiquidity });
              setAmount(isExactOut ? IOType.input : IOType.output, "");
            } else if (quote?.error?.includes("output amount too less")) {
              setError({ outputError: Errors.outLow });
              setAmount(IOType.input, "");
            } else if (quote?.error?.includes("output amount too high")) {
              setError({ outputError: Errors.outHigh });
              setAmount(IOType.input, "");
            } else {
              setAmount(isExactOut ? IOType.input : IOType.output, "");
            }
            setIsFetchingQuote({ input: false, output: false });
            setStrategy("");
            setTokenPrices({ input: "0", output: "0" });
            return;
          }

          const [_strategy, quoteAmount] = Object.entries(quote.val.quotes)[0];
          setStrategy(_strategy);
          setIsFetchingQuote({ input: false, output: false });
          const assetToChange = isExactOut ? fromAsset : toAsset;
          const quoteAmountInDecimals = new BigNumber(Number(quoteAmount)).div(
            Math.pow(10, assetToChange.decimals)
          );
          setAmount(
            isExactOut ? IOType.input : IOType.output,
            Number(
              quoteAmountInDecimals.toFixed(8, BigNumber.ROUND_DOWN)
            ).toString()
          );

          const inputAmount = isExactOut
            ? quoteAmountInDecimals
            : new BigNumber(amount);
          const outputAmount = isExactOut
            ? new BigNumber(amount)
            : quoteAmountInDecimals;
          const inputTokenPrice = inputAmount
            .multipliedBy(quote.val.input_token_price)
            .toFixed(2);
          const outputTokenPrice = outputAmount
            .multipliedBy(quote.val.output_token_price)
            .toFixed(2);

          setTokenPrices({
            input: inputTokenPrice,
            output: outputTokenPrice,
          });
        },
        500
      ),
    [
      getQuote,
      setIsFetchingQuote,
      setStrategy,
      setAmount,
      setTokenPrices,
      setError,
    ]
  );

  const fetchQuote = useCallback(
    async (
      amount: string,
      fromAsset: Asset,
      toAsset: Asset,
      isExactOut: boolean
    ) => {
      debouncedFetchQuote(amount, fromAsset, toAsset, isExactOut);
    },
    [debouncedFetchQuote]
  );

  const handleInputAmountChange = useCallback(
    async (amount: string) => {
      setAmount(IOType.input, amount);
      const amountInNumber = Number(amount);

      if (!amountInNumber) {
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        setAmount(IOType.output, "");
        setError({ inputError: Errors.none, swapError: undefined });
        return;
      }

      if (inputAsset && minAmount && amountInNumber < minAmount) {
        setError({
          inputError: Errors.minError(minAmount.toString(), inputAsset?.symbol),
          swapError: undefined,
        });
        setAmount(IOType.output, "0");
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        return;
      }

      if (inputAsset && maxAmount && amountInNumber > maxAmount) {
        setError({
          inputError: Errors.maxError(maxAmount.toString(), inputAsset?.symbol),
          swapError: undefined,
        });
        setAmount(IOType.output, "");
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        return;
      }

      setError({ inputError: Errors.none, swapError: undefined });

      if (!inputAsset || !outputAsset || !Number(amount)) return;

      fetchQuote(amount, inputAsset, outputAsset, false);
    },
    [
      inputAsset,
      outputAsset,
      minAmount,
      maxAmount,
      fetchQuote,
      debouncedFetchQuote,
      setAmount,
      setError,
    ]
  );

  const handleOutputAmountChange = async (amount: string) => {
    setAmount(IOType.output, amount);
    const amountInNumber = Number(amount);

    if (!amountInNumber) {
      // cancel debounced fetch quote
      debouncedFetchQuote.cancel();
      // abort if any calls are already in progress
      if (controller.current) controller.current.abort();
      setAmount(IOType.input, "");
      setError({ outputError: Errors.none, swapError: undefined });
      return;
    }

    setError({ outputError: Errors.none, swapError: undefined });

    if (!inputAsset || !outputAsset || !amountInNumber) return;

    fetchQuote(amount, inputAsset, outputAsset, true);
  };

  const needsWalletConnection = useMemo(() => {
    if (!evmAddress && !starknetAddress && !account) return false;
    if (!inputAsset || !outputAsset) return false;
    if (isEVM(inputAsset.chain) && !evmAddress) return "evm";
    if (isStarknet(inputAsset.chain) && !starknetAddress) return "starknet";

    if (isEVM(outputAsset.chain) && !evmAddress) return "evm";
    if (isStarknet(outputAsset.chain) && !starknetAddress) return "starknet";

    return null;
  }, [inputAsset, outputAsset, evmAddress, starknetAddress, account]);

  const handleSwapClick = async () => {
    if (needsWalletConnection) {
      setOpenModal(modalNames.connectWallet, {
        [needsWalletConnection]: true,
      });
      return;
    }
    if (
      !validSwap ||
      !swapAndInitiate ||
      !inputAsset ||
      !outputAsset ||
      !strategy
    )
      return;
    setIsSwapping(true);

    const inputAmountInDecimals = new BigNumber(inputAmount)
      .multipliedBy(10 ** inputAsset.decimals)
      .toFixed();
    const outputAmountInDecimals = new BigNumber(outputAmount)
      .multipliedBy(10 ** outputAsset.decimals)
      .toFixed();

    const additionalData = isBitcoinSwap
      ? {
          strategyId: strategy,
          btcAddress,
        }
      : {
          strategyId: strategy,
        };

    try {
      const res = await swapAndInitiate({
        fromAsset: inputAsset,
        toAsset: outputAsset,
        sendAmount: inputAmountInDecimals,
        receiveAmount: outputAmountInDecimals,
        additionalData,
      });

      if (res.error) {
        if (
          res.error.includes(
            "Cannot read properties of undefined (reading 'toLowerCase')"
          )
        ) {
          disconnect();
          setConnectingWallet(null);
          setOpenModal(modalNames.versionUpdate);
        }
        console.error("failed to create order ❌", res.error);
        setIsSwapping(false);
        return;
      }

      console.log("orderCreated ✅", res.val);

      if (isBitcoin(res.val.source_swap.chain)) {
        if (provider) {
          const order = res.val;
          const bitcoinRes = await provider.sendBitcoin(
            order.source_swap.swap_id,
            Number(order.source_swap.amount)
          );
          if (bitcoinRes.error) {
            console.error("failed to send bitcoin ❌", bitcoinRes.error);
            setIsSwapping(false);
          }
          const updatedOrder = {
            ...order,
            source_swap: {
              ...order.source_swap,
              initiate_tx_hash: bitcoinRes.val ?? "",
            },
            status: bitcoinRes.val
              ? OrderStatus.InitiateDetected
              : OrderStatus.Matched,
          };
          setOrder(updatedOrder);
          setIsOpen(true);
          updateOrder(updatedOrder);
          clearSwapState();
          return;
        }
        setIsSwapping(false);
        setOrder({ ...res.val, status: OrderStatus.Matched });
        setIsOpen(true);
        updateOrder({ ...res.val, status: OrderStatus.Matched });
        clearSwapState();
        return;
      }
      setIsSwapping(false);
      setOrder({ ...res.val, status: OrderStatus.InitiateDetected });
      updateOrder({ ...res.val, status: OrderStatus.InitiateDetected });
      setIsOpen(true);
      clearSwapState();
    } catch (error) {
      console.log("failed to create order ❌", error);
      setIsSwapping(false);
    }
  };

  useEffect(() => {
    if (!inputAsset || !outputAsset) return;
    setError({ outputError: "", inputError: "" });
    handleInputAmountChange(inputAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAsset, handleInputAmountChange, setError]);

  useEffect(() => {
    if (
      inputAmount == "0" ||
      outputAmount == "0" ||
      !inputAmount ||
      !outputAmount
    ) {
      setTokenPrices({ input: "0", output: "0" });
      if (!isInsufficientBalance) {
        setError({
          outputError: Errors.none,
          inputError: Errors.none,
          swapError: Errors.none,
        });
      } else {
        setError({
          outputError: Errors.none,
          inputError: Errors.none,
          swapError: Errors.insufficientBalance,
        });
      }
      return;
    }
  }, [
    inputAmount,
    outputAmount,
    setTokenPrices,
    setError,
    isInsufficientBalance,
  ]);

  useEffect(() => {
    if (!inputAmount || !minAmount || !maxAmount) return;
    const amountInNumber = Number(inputAmount);
    if (!amountInNumber) return;

    if (!isInsufficientBalance) {
      setError({ outputError: Errors.none, inputError: Errors.none });
    } else {
      setError({
        outputError: Errors.none,
        inputError: Errors.none,
        swapError: Errors.insufficientBalance,
      });
    }

    if (amountInNumber < minAmount && inputAsset) {
      setError({
        inputError: Errors.minError(minAmount.toString(), inputAsset?.symbol),
      });
      return;
    }
    if (amountInNumber > maxAmount && inputAsset) {
      setError({
        inputError: Errors.maxError(maxAmount.toString(), inputAsset?.symbol),
      });
      return;
    }
  }, [
    inputAmount,
    inputAsset,
    minAmount,
    maxAmount,
    inputAsset?.symbol,
    outputAsset?.symbol,
    setError,
    isInsufficientBalance,
  ]);

  useEffect(() => {
    if (account) {
      setBtcAddress(account);
    }
  }, [account, setBtcAddress]);

  return {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    tokenPrices,
    strategy,
    error,
    isEditBTCAddress,
    loading: isFetchingQuote,
    validSwap,
    isSwapping,
    isBitcoinSwap,
    inputTokenBalance,
    isValidBitcoinAddress,
    swapAssets,
    handleInputAmountChange,
    handleOutputAmountChange,
    setIsEditBTCAddress,
    needsWalletConnection,
    handleSwapClick,
  };
};
