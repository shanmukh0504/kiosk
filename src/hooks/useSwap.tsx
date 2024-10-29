import { useCallback, useEffect, useMemo, useState } from "react";
import { swapStore } from "../store/swapStore";
import { IOType } from "../constants/constants";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import debounce from "lodash.debounce";
import { assetInfoStore } from "../store/assetInfoStore";
import { constructOrderPair } from "@gardenfi/core";
import BigNumber from "bignumber.js";
import { useGarden } from "@gardenfi/react-hooks";

export const useSwap = () => {
  const [strategy, setStrategy] = useState<string>();
  const [loading, setLoading] = useState({
    input: false,
    output: false,
  });
  const [tokenPrices, setTokenPrices] = useState({
    input: "0",
    output: "0",
  });
  const [error, setError] = useState<string>();

  const {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    setAmount,
    btcAddress,
  } = swapStore();
  const { strategies } = assetInfoStore();
  const { getQuote } = useGarden();

  const _validSwap = useMemo(() => {
    return !!(
      inputAsset &&
      outputAmount &&
      inputAmount &&
      outputAsset &&
      strategy &&
      !error
    );
  }, [inputAsset, outputAmount, inputAmount, outputAsset, strategy, error]);
  const isBitcoinSwap = useMemo(() => {
    return !!(
      inputAsset &&
      outputAsset &&
      (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain))
    );
  }, [inputAsset, outputAsset]);
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
    debounce(
      async (
        amount: string,
        fromAsset: Asset,
        toAsset: Asset,
        isExactOut: boolean
      ) => {
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
      },
      500
    ),
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
        setError(`min. amount is ${minAmount}`);
        setAmount(IOType.output, "0");
        return;
      }
      if (maxAmount && amountInNumber > maxAmount) {
        setError(`max amount is ${maxAmount}`);
        setAmount(IOType.output, "0");
        return;
      }
      setError(undefined);

      if (!inputAsset || !outputAsset || !Number(amount)) return;
      fetchQuote(amount, inputAsset, outputAsset, false);
    },
    [inputAsset, outputAsset, minAmount, maxAmount]
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

  useEffect(() => {
    if (!inputAsset || !outputAsset) return;
    handleInputAmountChange(inputAmount);
  }, [inputAsset, outputAsset, handleInputAmountChange]);

  useEffect(() => {
    if (!inputAmount || !minAmount || !maxAmount) return;
    const amountInNumber = Number(inputAmount);
    if (!amountInNumber) return;
    if (amountInNumber < minAmount) {
      setError(`min. amount is ${minAmount}`);
      return;
    }
    if (amountInNumber > maxAmount) {
      setError(`max amount is ${maxAmount}`);
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
    isBitcoinSwap,
    handleInputAmountChange,
    handleOutputAmountChange,
  };
};
