import { useCallback, useEffect, useMemo, useRef } from "react";
import { swapStore } from "../store/swapStore";
import { IOType, network, QuoteError } from "../constants/constants";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import debounce from "lodash.debounce";
import { assetInfoStore } from "../store/assetInfoStore";
import {
  constructOrderPair,
  OrderStatus,
  validateBTCAddress,
} from "@gardenfi/core";
import BigNumber from "bignumber.js";
import { useGarden } from "@gardenfi/react-hooks";
import { useEVMWallet } from "./useEVMWallet";
import { useBalances } from "./useBalances";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { ordersStore } from "../store/ordersStore";
import { Environment } from "@gardenfi/utils";

export const useSwap = () => {
  const { inputTokenBalance } = useBalances();
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
    setEditing,
    setStrategy,
    setIsSwapping,
    setAmount,
    setError,
    setIsFetchingQuote,
    setTokenPrices,
    clearSwapState,
    setBtcAddress,
  } = swapStore();
  const { strategies } = assetInfoStore();
  const { setOrderInProgress } = ordersStore();
  const { address } = useEVMWallet();
  const { swapAndInitiate, getQuote } = useGarden();
  const { provider, account } = useBitcoinWallet();
  const controller = useRef<AbortController | null>(null);

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
      ? validateBTCAddress(btcAddress, network as Environment)
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
      !isInsufficientBalance
    );
  }, [
    inputAsset,
    outputAmount,
    inputAmount,
    outputAsset,
    strategy,
    error,
    address,
    isInsufficientBalance,
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
          if (!getQuote) return;

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

          if (quote.error) {
            if (quote.error.includes("AbortError")) return;
            if (quote.error.includes("output amount too high")) {
              setError({ outputError: "Output amount too high" });
              setAmount(IOType.input, "");
            } else if (quote.error.includes("output amount too less")) {
              setError({ outputError: "Output amount too less" });
              setAmount(IOType.input, "");
            } else if (quote.error.includes("insufficient liquidity")) {
              setError({ quoteError: QuoteError.InsufficientLiquidity });
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
          const quoteAmountInDecimals = new BigNumber(quoteAmount).div(
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
      setAmount,
      setIsFetchingQuote,
      setStrategy,
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
        setError({ inputError: "" });
        return;
      }

      if (minAmount && amountInNumber < minAmount) {
        setError({
          inputError: `Minimum amount is ${minAmount} ${inputAsset?.symbol}`,
        });
        setAmount(IOType.output, "0");
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();

        return;
      }

      if (maxAmount && amountInNumber > maxAmount) {
        setError({
          inputError: `Maximum amount is ${maxAmount} ${inputAsset?.symbol}`,
        });
        setAmount(IOType.output, "");
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        return;
      }

      setError({ inputError: "" });

      if (!inputAsset || !outputAsset || !Number(amount)) return;
      const trimmedAmount = amount.includes(".")
        ? amount.replace(/^0+/, "0")
        : amount.replace(/^0+/, "");
      setAmount(IOType.input, trimmedAmount);
      fetchQuote(trimmedAmount, inputAsset, outputAsset, false);
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

  const handleOutputAmountChange = useCallback(
    async (amount: string) => {
      setAmount(IOType.output, amount);
      const amountInNumber = Number(amount);

      if (!amountInNumber) {
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        setAmount(IOType.input, "");
        setError({ outputError: "" });
        return;
      }

      if (!inputAsset || !outputAsset || !amountInNumber) return;

      const trimmedAmount = amount.includes(".")
        ? amount.replace(/^0+/, "0")
        : amount.replace(/^0+/, "");
      setError({ outputError: "" });
      setAmount(IOType.output, trimmedAmount);

      fetchQuote(trimmedAmount, inputAsset, outputAsset, true);
    },
    [
      inputAsset,
      outputAsset,
      debouncedFetchQuote,
      fetchQuote,
      setAmount,
      setError,
    ]
  );

  const handleSwapClick = async () => {
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
          const updateOrder = {
            ...order,
            source_swap: {
              ...order.source_swap,
              initiate_tx_hash: bitcoinRes.val ?? "",
            },
            status: bitcoinRes.val
              ? OrderStatus.InitiateDetected
              : OrderStatus.Matched,
          };
          setOrderInProgress(updateOrder);
          clearSwapState();
          return;
        }
        setIsSwapping(false);
        setOrderInProgress({ ...res.val, status: OrderStatus.Matched });
        clearSwapState();
        return;
      }
      setIsSwapping(false);
      setOrderInProgress({ ...res.val, status: OrderStatus.InitiateDetected });
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
    if (inputAmount == "0" || outputAmount == "0") {
      setTokenPrices({ input: "0", output: "0" });
      setError({ outputError: "", inputError: "" });
      return;
    }
  }, [inputAmount, outputAmount, setTokenPrices, setError]);

  useEffect(() => {
    if (!inputAmount || !minAmount || !maxAmount) return;
    const amountInNumber = Number(inputAmount);
    if (!amountInNumber) return;

    if (
      inputAsset &&
      outputAsset &&
      !isBitcoin(inputAsset.chain) &&
      !isBitcoin(outputAsset?.chain)
    ) {
      setEditing(IOType.input, false);
      setEditing(IOType.output, false);
    }

    setError({ outputError: "", inputError: "" });

    if (amountInNumber < minAmount) {
      setError({
        inputError: `Minimum amount is ${minAmount} ${inputAsset?.symbol}`,
      });
      return;
    }
    if (amountInNumber > maxAmount) {
      setError({
        inputError: `Maximum amount is ${maxAmount} ${inputAsset?.symbol}`,
      });
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputAmount,
    minAmount,
    maxAmount,
    inputAsset?.symbol,
    outputAsset?.symbol,
    setError,
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
    loading: isFetchingQuote,
    validSwap,
    isSwapping,
    isBitcoinSwap,
    handleInputAmountChange,
    handleOutputAmountChange,
    inputTokenBalance,
    isValidBitcoinAddress,
    handleSwapClick,
    isInsufficientBalance,
  };
};
