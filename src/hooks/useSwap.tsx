import { useCallback, useEffect, useMemo, useRef } from "react";
import { swapStore } from "../store/swapStore";
import { IOType, network } from "../constants/constants";
import { Asset, isBitcoin, NetworkType } from "@gardenfi/orderbook";
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

export const useSwap = () => {
  const { inputTokenBalance } = useBalances();
  const {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    isSwapping,
    strategy,
    btcAddress,
    tokenPrices,
    isFetchingQuote,
    inputError,
    outputError,
    setStrategy,
    setIsSwapping,
    setAmount,
    setError,
    setIsFetchingQuote,
    setTokenPrices,
    swapAssetsAndAmounts,
    clearSwapState,
    setBtcAddress,
  } = swapStore();
  const { strategies } = assetInfoStore();
  const { setOrderInProgress } = ordersStore();
  const { address } = useEVMWallet();
  const { swapAndInitiate, getQuote } = useGarden();
  const { provider, account } = useBitcoinWallet();
  const fetchQuoteController = useRef<(() => void) | null>(null);
  const isSwappingInProgress = useRef(false);

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
      ? validateBTCAddress(btcAddress, network as unknown as NetworkType)
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
      !inputError &&
      !outputError &&
      !isInsufficientBalance
    );
  }, [
    inputAsset,
    outputAmount,
    inputAmount,
    outputAsset,
    strategy,
    inputError,
    outputError,
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
      strategies.val && {
        input:
          strategies.val[
            constructOrderPair(
              inputAsset.chain,
              inputAsset.atomicSwapAddress,
              outputAsset.chain,
              outputAsset.atomicSwapAddress
            )
          ],
        output:
          strategies.val[
            constructOrderPair(
              outputAsset.chain,
              outputAsset.atomicSwapAddress,
              inputAsset.chain,
              inputAsset.atomicSwapAddress
            )
          ],
      }
    );
  }, [inputAsset, outputAsset, strategies.val]);

  const minAmount = useMemo(() => {
    let inputMin = 0;
    let outputMin = 0;

    if (swapLimits) {
      inputMin = new BigNumber(swapLimits.input.minAmount)
        .dividedBy(10 ** inputAsset!.decimals)
        .toNumber();
      outputMin = new BigNumber(swapLimits.output.minAmount)
        .dividedBy(10 ** outputAsset!.decimals)
        .toNumber();
    }
    return {
      input: inputMin,
      output: outputMin,
    };
  }, [swapLimits, inputAsset, outputAsset]);

  const maxAmount = useMemo(() => {
    let inputMin = 0;
    let outputMin = 0;

    if (swapLimits) {
      inputMin = new BigNumber(swapLimits.input.maxAmount)
        .dividedBy(10 ** inputAsset!.decimals)
        .toNumber();
      outputMin = new BigNumber(swapLimits.output.maxAmount)
        .dividedBy(10 ** outputAsset!.decimals)
        .toNumber();
    }
    return {
      input: inputMin,
      output: outputMin,
    };
  }, [swapLimits, inputAsset, outputAsset]);

  const fetchQuote = useCallback(
    async (
      amount: string,
      fromAsset: Asset,
      toAsset: Asset,
      isExactOut: boolean
    ) => {
      let cancelled = false;

      fetchQuoteController.current = () => {
        cancelled = true;
      };

      const debouncedFetchQuote = debounce(async () => {
        if (!getQuote) return;
        if (isExactOut) setIsFetchingQuote({ input: true, output: false });
        else setIsFetchingQuote({ input: false, output: true });

        const assetDecimals = isExactOut
          ? toAsset.decimals
          : fromAsset.decimals;

        const amountInDecimals = new BigNumber(amount).multipliedBy(
          10 ** assetDecimals
        );

        const quote = await getQuote({
          fromAsset,
          toAsset,
          amount: amountInDecimals.toNumber(),
          isExactOut,
        });

        if (cancelled) {
          setIsFetchingQuote({ input: false, output: false });
          return;
        }

        if (quote.error) {
          if (quote.error.includes("output amount too high")) {
            setError(IOType.output, "Output amount too high");
            setAmount(IOType.input, "");
          } else if (quote.error.includes("output amount too less")) {
            setError(IOType.output, "Output amount too less");
          } else {
            setAmount(IOType.input, "");
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
      }, 500);
      debouncedFetchQuote();
    },
    [
      getQuote,
      setAmount,
      setStrategy,
      setTokenPrices,
      setIsFetchingQuote,
      setError,
    ]
  );

  const abortFetchQuote = useCallback(() => {
    if (fetchQuoteController.current) {
      fetchQuoteController.current();
      fetchQuoteController.current = null;
      setTokenPrices({ input: "0", output: "0" });
    }
  }, [setTokenPrices]);

  useEffect(() => {
    return () => abortFetchQuote();
  }, [abortFetchQuote]);

  const debounceFetch = useMemo(
    () =>
      debounce(
        async (
          amount: string,
          fromAsset: Asset,
          toAsset: Asset,
          isExactOut: boolean
        ) => {
          setAmount(isExactOut ? IOType.output : IOType.input, amount);
          fetchQuote(amount, fromAsset, toAsset, isExactOut);
        },
        500
      ),
    [fetchQuote, setAmount]
  );

  const handleInputAmountChange = useCallback(
    async (amount: string) => {
      setAmount(IOType.input, amount);
      debounceFetch.cancel();
      abortFetchQuote();

      const amountInNumber = Number(amount);
      if (!amountInNumber) {
        setAmount(IOType.output, "");
        setError(IOType.input, "");
        return;
      }

      if (minAmount.input && amountInNumber < minAmount.input) {
        setError(
          IOType.input,
          `Minimum amount is ${minAmount.input} ${inputAsset?.symbol}`
        );
        setAmount(IOType.output, "");
        return;
      }
      if (maxAmount.input && amountInNumber > maxAmount.input) {
        setError(
          IOType.input,
          `Maximum amount is ${maxAmount.input} ${inputAsset?.symbol}`
        );
        setAmount(IOType.output, "");
        return;
      }
      setError(IOType.input, "");

      if (!inputAsset || !outputAsset || !Number(amount)) return;
      const trimmedAmount = amount.includes(".")
        ? amount.replace(/^0+/, "0")
        : amount.replace(/^0+/, "");
      debounceFetch(trimmedAmount, inputAsset, outputAsset, false);
    },
    [
      inputAsset,
      outputAsset,
      minAmount.input,
      maxAmount.input,
      setAmount,
      setError,
      debounceFetch,
      abortFetchQuote,
    ]
  );

  const handleOutputAmountChange = useCallback(
    async (amount: string) => {
      setAmount(IOType.output, amount);
      debounceFetch.cancel();
      abortFetchQuote();

      const amountInNumber = Number(amount);
      if (!amountInNumber && (!Number(inputAmount) || inputAmount === "0")) {
        setError(IOType.output, "");
        setAmount(IOType.input, "");
        return;
      }
      if (!inputAsset || !outputAsset) return;

      if (!amountInNumber && (inputAmount !== "0" || !Number(inputAmount))) {
        debounceFetch(inputAmount, inputAsset, outputAsset, false);
        return;
      }
      if (!Number(amount)) return;
      setError(IOType.output, "");

      debounceFetch(amount, inputAsset, outputAsset, true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      inputAsset,
      outputAsset,
      setAmount,
      setError,
      debounceFetch,
      abortFetchQuote,
    ]
  );

  const handleAssetSwap = useCallback(async () => {
    if (isSwappingInProgress.current) return;
    isSwappingInProgress.current = true;

    try {
      if (!inputAsset || !outputAsset || !outputAmount) {
        return;
      }

      swapAssetsAndAmounts();

      if (Number(inputAmount)) {
        await fetchQuote(inputAmount, outputAsset, inputAsset, true);
      }
    } catch (error) {
      console.error("Error during asset swap:", error);
    } finally {
      isSwappingInProgress.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAsset, outputAsset, inputAmount, outputAmount, fetchQuote]);

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
    if (!inputAsset || !outputAsset || isSwappingInProgress.current) return;
    setError(IOType.output, "");
    setError(IOType.input, "");
    handleInputAmountChange(inputAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAsset, handleInputAmountChange, setError]);

  useEffect(() => {
    if (!inputAsset || !outputAsset || isSwappingInProgress.current) return;
    setError(IOType.output, "");
    setError(IOType.input, "");
    handleInputAmountChange(inputAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputAsset, handleInputAmountChange, setError]);

  useEffect(() => {
    if (inputAmount == "0" || outputAmount == "0") {
      setTokenPrices({ input: "0", output: "0" });
      setError(IOType.output, "");
      setError(IOType.input, "");
      return;
    }
  }, [inputAmount, outputAmount, setTokenPrices, setError]);

  useEffect(() => {
    if (!inputAmount || !minAmount.input || !maxAmount.input) return;
    const amountInNumber = Number(inputAmount);
    if (!amountInNumber) return;
    if (amountInNumber < minAmount.input) {
      setError(
        IOType.input,
        `Minimum amount is ${minAmount.input} ${inputAsset?.symbol}`
      );
      return;
    }
    if (amountInNumber > maxAmount.input) {
      setError(
        IOType.input,
        `Maximum amount is ${maxAmount.input} ${inputAsset?.symbol}`
      );
      return;
    }
    setError(IOType.output, "");
    setError(IOType.input, "");
  }, [
    inputAmount,
    minAmount.input,
    maxAmount.input,
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
    inputError,
    outputError,
    isSwapping,
    isBitcoinSwap,
    handleAssetSwap,
    handleInputAmountChange,
    handleOutputAmountChange,
    inputTokenBalance,
    isValidBitcoinAddress,
    handleSwapClick,
    isInsufficientBalance,
  };
};
