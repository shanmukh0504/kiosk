import { useCallback, useEffect, useMemo, useState } from "react";
import { swapStore } from "../store/swapStore";
import { IOType } from "../constants/constants";
import { Asset, isBitcoin, NetworkType } from "@gardenfi/orderbook";
import debounce from "lodash.debounce";
import { assetInfoStore } from "../store/assetInfoStore";
import { constructOrderPair, validateBTCAddress } from "@gardenfi/core";
import BigNumber from "bignumber.js";
import { useGarden } from "@gardenfi/react-hooks";
import { useEVMWallet } from "./useEVMWallet";
import { useBalances } from "./useBalances";

export type TokenPrices = {
  input: string;
  output: string;
};

export const useSwap = () => {
  const [strategy, setStrategy] = useState<string>();
  const [isSwapping, setIsSwapping] = useState(false);
  const [loading, setLoading] = useState({
    input: false,
    output: false,
  });
  const [tokenPrices, setTokenPrices] = useState<TokenPrices>({
    input: "0",
    output: "0",
  });
  const [error, setError] = useState<string>();

  const { inputTokenBalance } = useBalances();
  const {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    setAmount,
    btcAddress,
    setShowConfirmSwap,
    clearAmounts,
  } = swapStore();
  const { strategies } = assetInfoStore();
  const { address } = useEVMWallet();
  const { swap, getQuote } = useGarden();

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
      ? validateBTCAddress(btcAddress, NetworkType.testnet)
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
      !error &&
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

  const fetchQuote = useCallback(
    async (
      amount: string,
      fromAsset: Asset,
      toAsset: Asset,
      isExactOut: boolean
    ) => {
      const debouncedFetchQuote = debounce(async () => {
        if (!getQuote) return;
        if (isExactOut) setLoading({ input: true, output: false });
        else setLoading({ input: false, output: true });

        const amountInDecimals = new BigNumber(amount).multipliedBy(
          10 ** fromAsset.decimals
        );
        const quote = await getQuote({
          fromAsset,
          toAsset,
          amount: amountInDecimals.toNumber(),
          isExactOut,
        });
        if (quote.error) {
          setAmount(isExactOut ? IOType.input : IOType.output, "0");
          setLoading({ input: false, output: false });
          setStrategy("");
          setTokenPrices({ input: "0", output: "0" });
          return;
        }

        const [_strategy, quoteAmount] = Object.entries(quote.val.quotes)[0];
        setStrategy(_strategy);
        setLoading({ input: false, output: false });
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
    [getQuote, setAmount]
  );

  const handleInputAmountChange = useCallback(
    async (amount: string) => {
      setAmount(IOType.input, amount);
      const amountInNumber = Number(amount);
      if (!amountInNumber) {
        setAmount(IOType.output, "0");
        return;
      }
      if (minAmount && amountInNumber < minAmount) {
        setError(`Minimum amount is ${minAmount} ${inputAsset?.symbol}`);
        setAmount(IOType.output, "0");
        return;
      }
      if (maxAmount && amountInNumber > maxAmount) {
        setError(`Maximum amount is ${maxAmount} ${inputAsset?.symbol}`);
        setAmount(IOType.output, "0");
        return;
      }
      setError(undefined);

      if (!inputAsset || !outputAsset || !Number(amount)) return;
      fetchQuote(amount, inputAsset, outputAsset, false);
    },
    [inputAsset, outputAsset, minAmount, maxAmount, fetchQuote, setAmount]
  );

  const handleOutputAmountChange = async (amount: string) => {
    setAmount(IOType.output, amount);
    const amountInNumber = Number(amount);
    if (!amountInNumber) {
      setAmount(IOType.input, "0");
      return;
    }

    if (!inputAsset || !outputAsset || !Number(amount)) return;
    fetchQuote(amount, inputAsset, outputAsset, true);
  };

  const handleSwapClick = async () => {
    if (!validSwap || !swap || !inputAsset || !outputAsset || !strategy) return;
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
      const res = await swap({
        fromAsset: inputAsset,
        toAsset: outputAsset,
        sendAmount: inputAmountInDecimals,
        receiveAmount: outputAmountInDecimals,
        additionalData,
      });
      setIsSwapping(false);
      if (res.error) {
        console.error("failed to create order ❌", res.error);
        return;
      }

      //TODO: add a notification here and clear all amounts and addresses
      console.log("orderCreated ✅", res.val);
      clearAmounts();

      if (isBitcoin(res.val.source_swap.chain)) {
        setShowConfirmSwap({
          isOpen: true,
          order: res.val,
        });
      }
    } catch (error) {
      console.log("failed to create order ❌", error);
      setIsSwapping(false);
    }
  };

  useEffect(() => {
    if (!inputAsset || !outputAsset) return;
    handleInputAmountChange(inputAmount);
  }, [inputAsset, outputAsset, handleInputAmountChange, inputAmount]);

  useEffect(() => {
    if (!inputAmount || !outputAmount) {
      setTokenPrices({ input: "0", output: "0" });
      setError(undefined);
      return;
    }
  }, [inputAmount, outputAmount]);

  useEffect(() => {
    if (!inputAmount || !minAmount || !maxAmount) return;
    const amountInNumber = Number(inputAmount);
    if (!amountInNumber) return;
    if (amountInNumber < minAmount) {
      setError(`Minimum amount is ${minAmount} ${inputAsset?.symbol}`);
      return;
    }
    if (amountInNumber > maxAmount) {
      setError(`Maximum amount is ${maxAmount} ${inputAsset?.symbol}`);
      return;
    }
    setError(undefined);
  }, [inputAmount, minAmount, maxAmount]);

  return {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    tokenPrices,
    strategy,
    loading,
    validSwap,
    error,
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
