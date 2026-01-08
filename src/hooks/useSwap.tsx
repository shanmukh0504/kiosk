import { useCallback, useEffect, useMemo, useRef } from "react";
import { BTC, swapStore } from "../store/swapStore";
import { IOType } from "../constants/constants";
import {
  Asset,
  BitcoinOrderResponse,
  Chain,
  isBitcoin,
  isSolana,
  isSui,
  OrderStatus,
  isStarknet,
  isEVM,
  ChainAsset,
  isTron,
  Chains,
  isLitecoin,
  isAlpenSignet,
} from "@gardenfi/orderbook";
import debounce from "lodash.debounce";
import { useGarden } from "@gardenfi/react-hooks";
import { useStarknetWallet } from "./useStarknetWallet";
import { useEVMWallet } from "./useEVMWallet";
import { modalNames, modalStore } from "../store/modalStore";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { Errors } from "../constants/errors";
import { ConnectingWalletStore } from "../store/connectWalletStore";
import orderInProgressStore from "../store/orderInProgressStore";
import pendingOrdersStore from "../store/pendingOrdersStore";
import BigNumber from "bignumber.js";
import { useSolanaWallet } from "./useSolanaWallet";
import {
  formatAmount,
  formatBalance,
  isAsset,
  isBitcoinSwap,
} from "../utils/utils";
import { useNetworkFees } from "./useNetworkFees";
import { useSuiWallet } from "./useSuiWallet";
import logger from "../utils/logger";
import { balanceStore } from "../store/balanceStore";
import { useTronWallet } from "./useTronWallet";
import { Toast } from "../components/toast/Toast";

export const useSwap = () => {
  const {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    isSwapping,
    isApproving,
    rate,
    error,
    tokenPrices,
    isFetchingQuote,
    isEditAddress,
    networkFees,
    setIsSwapping,
    setAmount,
    setRate,
    setError,
    swapAssets,
    setAsset,
    setIsFetchingQuote,
    setFiatTokenPrices,
    setFixedFee,
    isComparisonVisible,
    // setIsApproving,
    setTokenPrices,
    clearSwapState,
    setIsComparisonVisible,
    solverId,
    setSolverId,
    validAddress,
    sourceAddress: walletSource,
    destinationAddress: walletDestination,
    userProvidedAddress,
  } = swapStore();
  const { balances } = balanceStore();

  // Resolve addresses: userProvidedAddress first, then walletAddress
  const sourceAddress = userProvidedAddress.source || walletSource;
  const destinationAddress =
    userProvidedAddress.destination || walletDestination;
  const { setOrder, setIsOpen } = orderInProgressStore();
  const { updateOrder } = pendingOrdersStore();
  const { disconnect } = useEVMWallet();
  const { swap, getQuote, garden } = useGarden();
  const { provider } = useBitcoinWallet();
  const { provider: ltcProvider } = useLitecoinWallet();
  const controller = useRef<AbortController | null>(null);
  const { setConnectingWallet } = ConnectingWalletStore();
  const { address: evmAddress } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { setOpenModal } = modalStore();
  const { solanaAddress } = useSolanaWallet();
  const { tronAddress } = useTronWallet();
  const { currentAccount } = useSuiWallet();
  useNetworkFees();

  const inputBalance = useMemo(() => {
    if (!inputAsset || !balances) return;
    return balances[ChainAsset.from(inputAsset.id).toString()];
  }, [inputAsset, balances]);

  const inputTokenBalance = useMemo(
    () =>
      inputBalance &&
      inputAsset &&
      formatBalance(
        Number(inputBalance),
        inputAsset.decimals,
        Math.min(inputAsset.decimals, BTC.decimals)
      ),
    [inputBalance, inputAsset]
  );

  const isInsufficientBalance = useMemo(() => {
    if (!inputAmount || inputTokenBalance == null) return false;
    return BigNumber(inputAmount).gt(inputTokenBalance);
  }, [inputAmount, inputTokenBalance]);

  const _validSwap = useMemo(() => {
    return !!(
      inputAsset &&
      outputAmount &&
      inputAmount &&
      outputAsset &&
      validAddress.source &&
      validAddress.destination &&
      !error.inputError &&
      !error.outputError &&
      !error.liquidityError &&
      !error.insufficientBalanceError
    );
  }, [
    inputAsset,
    outputAmount,
    inputAmount,
    outputAsset,
    error,
    validAddress.source,
    validAddress.destination,
  ]);

  const validSwap = useMemo(() => {
    if (!_validSwap) return false;

    // Simply check if both addresses are present (using resolved addresses)
    if (!sourceAddress || !destinationAddress) return false;

    return true;
  }, [_validSwap, sourceAddress, destinationAddress]);

  const { minAmount, maxAmount } = useMemo(() => {
    const defaultLimits = {
      minAmount: 0,
      maxAmount: 0,
    };
    if (!inputAsset || !outputAsset) return defaultLimits;
    if (
      !inputAsset.min_amount ||
      !inputAsset.max_amount ||
      !outputAsset.min_amount ||
      !outputAsset.max_amount
    )
      return defaultLimits;
    else {
      let minAmountRaw = inputAsset.min_amount;

      if (
        isAsset(inputAsset, Chains.arbitrum) &&
        isAsset(outputAsset, Chains.monad)
      ) {
        minAmountRaw = "2200";
      } else if (
        isAsset(inputAsset, Chains.monad) &&
        isAsset(outputAsset, Chains.arbitrum, "WBTC")
      ) {
        if (isAsset(inputAsset, Chains.monad, "USDC")) {
          minAmountRaw = "2000000";
        } else if (isAsset(inputAsset, Chains.monad, "MON")) {
          minAmountRaw = "51000000000000000000";
        }
      }

      return {
        minAmount: formatAmount(
          minAmountRaw,
          inputAsset.decimals,
          inputAsset.decimals
        ),
        maxAmount: formatAmount(
          inputAsset.max_amount,
          inputAsset.decimals,
          inputAsset.decimals
        ),
      };
    }
  }, [inputAsset, outputAsset]);

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
            options: {
              request: {
                signal: controller.current.signal,
              },
            },
          });
          if (!quote || !quote.ok) {
            if (quote?.error?.includes("AbortError")) {
              setError({ liquidityError: Errors.none });
              setIsFetchingQuote({ input: false, output: false });
              return;
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
            setTokenPrices({ input: "0", output: "0" });
            return;
          }

          const q = quote.val[0];
          // Set fixed fee from quote if provided
          if (q.fixed_fee != null) {
            const asNumber = Number(q.fixed_fee);
            if (!Number.isNaN(asNumber)) setFixedFee(asNumber);
          }

          setSolverId(q.solver_id);

          const quoteAmount = isExactOut
            ? q.source.amount
            : q.destination.amount;

          const assetToChange = isExactOut ? fromAsset : toAsset;
          const quoteAmountInDecimals = new BigNumber(Number(quoteAmount)).div(
            Math.pow(10, assetToChange.decimals)
          );
          // Add network fee to output amount before calculating rate
          let outputAmountWithFee = Number(quoteAmountInDecimals);
          if (fromAsset.symbol === "USDC" && toAsset.symbol === "USDC") {
            outputAmountWithFee = Number(quoteAmountInDecimals) + networkFees;
          }
          const rate = outputAmountWithFee / Number(amount);
          setRate(rate);

          setAmount(
            isExactOut ? IOType.input : IOType.output,
            Number(
              quoteAmountInDecimals.toFixed(8, BigNumber.ROUND_DOWN)
            ).toString()
          );
          setIsFetchingQuote({ input: false, output: false });

          setFiatTokenPrices({
            input: q.source.value.toString(),
            output: q.destination.value.toString(),
          });
          setTokenPrices({
            input: q.source.value.toString(),
            output: q.destination.value.toString(),
          });
          setError({
            liquidityError: Errors.none,
          });
        },
        500
      ),
    [
      getQuote,
      setIsFetchingQuote,
      setRate,
      setAmount,
      setFixedFee,
      setTokenPrices,
      setSolverId,
      setFiatTokenPrices,
      setError,
      isSwapping,
      networkFees,
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
        setTokenPrices({ input: "0", output: "0" });
        setError({ inputError: Errors.none, liquidityError: Errors.none });
        return;
      }

      if (inputAsset && minAmount && amountInNumber < minAmount) {
        setError({
          inputError: Errors.minError(minAmount.toString(), inputAsset?.symbol),
        });
        setAmount(IOType.output, "");
        setTokenPrices({ input: "0", output: "0" });
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        return;
      }

      if (inputAsset && maxAmount && amountInNumber > maxAmount) {
        setError({
          inputError: Errors.maxError(maxAmount.toString(), inputAsset?.symbol),
        });
        setAmount(IOType.output, "");
        // cancel debounced fetch quote
        debouncedFetchQuote.cancel();
        // abort if any calls are already in progress
        if (controller.current) controller.current.abort();
        return;
      }

      setError({ inputError: Errors.none });

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
      setTokenPrices,
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
      setError({ outputError: Errors.none });
      return;
    }

    setError({ outputError: Errors.none });

    if (!inputAsset || !outputAsset || !amountInNumber) return;

    fetchQuote(amount, inputAsset, outputAsset, true);
  };

  const needsWalletConnection = useMemo<null | string>(() => {
    if (!inputAsset || !outputAsset) return null;

    if (
      !inputAmount ||
      inputAmount === "0" ||
      !outputAmount ||
      outputAmount === "0"
    ) {
      return null;
    }

    const chainRequirements = {
      evm: {
        check: (chain: Chain) => isEVM(chain),
        address: evmAddress,
      },
      starknet: {
        check: (chain: Chain) => isStarknet(chain),
        address: starknetAddress,
      },
      solana: {
        check: (chain: Chain) => isSolana(chain),
        address: solanaAddress,
      },
      sui: {
        check: (chain: Chain) => isSui(chain),
        address: currentAccount?.address,
      },
      tron: {
        check: (chain: Chain) => isTron(chain),
        address: tronAddress,
      },
    };

    for (const [chainKey, { check, address }] of Object.entries(
      chainRequirements
    )) {
      if ((check(inputAsset.chain) || check(outputAsset.chain)) && !address) {
        return chainKey;
      }
    }

    return null;
  }, [
    inputAsset,
    outputAsset,
    inputAmount,
    outputAmount,
    evmAddress,
    starknetAddress,
    solanaAddress,
    currentAccount,
    tronAddress,
  ]);

  const handleSwapClick = async () => {
    if (needsWalletConnection) {
      setOpenModal(modalNames.connectWallet, {
        [needsWalletConnection]: true,
      });
      return;
    }
    if (
      !validSwap ||
      !swap ||
      !inputAsset ||
      !outputAsset ||
      !sourceAddress ||
      !destinationAddress
    )
      return;
    setIsSwapping(true);

    const inputAmountInDecimals = new BigNumber(inputAmount)
      .multipliedBy(10 ** inputAsset.decimals)
      .toFixed();
    const outputAmountInDecimals = new BigNumber(outputAmount)
      .multipliedBy(10 ** outputAsset.decimals)
      .toFixed();

    try {
      // if (!wallet) return;

      // const _walletClient = await switchOrAddNetwork(inputAsset.chain, wallet);

      // if (_walletClient.error) return Error(_walletClient.error);
      // wallet = _walletClient.val.walletClient as typeof wallet & {
      //   account: Account;
      // };
      // if (!wallet.account) return Error("No account found");

      // const allowance = await checkAllowance(
      //   Number(inputAmountInDecimals),
      //   inputAsset.tokenAddress,
      //   inputAsset.atomicSwapAddress,
      //   wallet
      // );

      // if (!allowance) {
      //   setIsApproving(true);
      //   const res = await approve(
      //     inputAsset.tokenAddress,
      //     inputAsset.atomicSwapAddress,
      //     wallet
      //   );
      //   if (res instanceof Error) {
      //     console.error("failed to approve ❌", res.message);
      //     setIsApproving(false);
      //     return;
      //   }
      //   setIsApproving(false);
      // }

      const res = await swap({
        fromAsset: inputAsset,
        toAsset: outputAsset,
        sendAmount: inputAmountInDecimals,
        receiveAmount: outputAmountInDecimals,
        solverId,
        sourceAddress: sourceAddress,
        destinationAddress: destinationAddress,
      });

      if (!res.ok) {
        if (
          res.error.includes(
            "Cannot read properties of undefined (reading 'toLowerCase')"
          )
        ) {
          disconnect();
          setConnectingWallet(null);
        } else if (res.error.includes("destination amount too high")) {
          //order failed due to price fluctuation, refresh quote here
          fetchQuote(inputAmount, inputAsset, outputAsset, false);
        } else {
          if (res.error.includes("insufficient liquidity")) {
            setError({ liquidityError: Errors.insufficientLiquidity });
            Toast.error("No liquidity sources found");
          } else logger.error("failed to create order ❌", res.error);
        }
        setIsSwapping(false);
        return;
      }

      logger.log("orderCreated ✅", res.val);

      // Extract order ID from response - could be string or BitcoinOrderResponse
      const orderId = typeof res.val === "string" ? res.val : res.val.order_id;
      const orderResult = await garden?.getOrder(orderId);

      if (!orderResult || !orderResult.ok) {
        logger.error("failed to fetch order ❌", orderResult?.error);
        setIsSwapping(false);
        return;
      }

      const order = orderResult.val;

      if (isLitecoin(inputAsset.chain)) {
        const orderResponse = res.val as BitcoinOrderResponse;
        if (ltcProvider && !isAlpenSignet(inputAsset.chain)) {
          const litecoinRes = await ltcProvider?.sendLitecoin(
            orderResponse.to,
            Number(orderResponse.amount)
          );
          if (!litecoinRes.ok) {
            logger.error("failed to send litecoin ❌", litecoinRes?.error);
            setIsSwapping(false);
          }
          const updatedOrder = {
            ...order,
            source_swap: {
              ...order.source_swap,
              initiate_tx_hash: litecoinRes.val ?? "",
            },
            status: litecoinRes.val
              ? OrderStatus.InitiateDetected
              : OrderStatus.Created,
          };
          setOrder(updatedOrder);
          setIsOpen(true);
          updateOrder(updatedOrder);
          clearSwapState();
          return;
        }
      }
      if (isBitcoin(inputAsset.chain)) {
        const orderResponse = res.val as BitcoinOrderResponse;
        if (provider && !isAlpenSignet(inputAsset.chain)) {
          const bitcoinRes = await provider.sendBitcoin(
            orderResponse.to,
            Number(orderResponse.amount)
          );
          if (bitcoinRes.error) {
            logger.error("failed to send bitcoin ❌", bitcoinRes.error);
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
              : OrderStatus.Created,
          };
          setOrder(updatedOrder);
          setIsOpen(true);
          updateOrder(updatedOrder);
          clearSwapState();
          return;
        }
        setIsSwapping(false);
        setOrder({ ...order, status: OrderStatus.Created });
        setIsOpen(true);
        updateOrder({ ...order, status: OrderStatus.Created });
        clearSwapState();
        return;
      }
      setIsSwapping(false);
      setOrder({ ...order, status: OrderStatus.Initiated });
      updateOrder({ ...order, status: OrderStatus.Initiated });
      setIsOpen(true);
      clearSwapState();
    } catch (error) {
      logger.error("failed to create order ❌", error);
      setIsSwapping(false);
      throw error;
    }
  };

  //interval for fetching quote in interval of 5 seconds
  useEffect(() => {
    if (
      !inputAsset ||
      !outputAsset ||
      !inputAmount ||
      isSwapping ||
      isComparisonVisible
    )
      return;

    const interval = setInterval(() => {
      fetchQuote(inputAmount, inputAsset, outputAsset, false);
    }, 5000);
    return () => clearInterval(interval);
  }, [
    inputAmount,
    inputAsset,
    outputAsset,
    fetchQuote,
    isSwapping,
    isComparisonVisible,
  ]);

  //call input amount handler when assets are changed
  useEffect(() => {
    if (!inputAsset || !outputAsset) return;
    setError({ inputError: "" });
    handleInputAmountChange(inputAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAsset, handleInputAmountChange, setError]);

  //set token prices to 0 if input and output amounts are 0 and set liq error to false
  useEffect(() => {
    if (
      outputAmount == "0" ||
      !outputAmount ||
      inputAmount == "0" ||
      !inputAmount
    ) {
      setTokenPrices({ input: "0", output: "0" });
      return;
    }
  }, [inputAmount, outputAmount, setTokenPrices, setError]);

  //set min and max amount errors when amounts are changed
  useEffect(() => {
    if (!inputAmount || !minAmount || !maxAmount) return;
    const amountInNumber = Number(inputAmount);

    if (!amountInNumber) return;

    if (amountInNumber < minAmount && inputAsset) {
      setError({
        inputError: Errors.minError(minAmount.toString(), inputAsset.symbol),
      });
      setTokenPrices({ input: "0", output: "0" });
      setAmount(IOType.output, "");
      return;
    }
    if (amountInNumber > maxAmount && inputAsset) {
      setError({
        inputError: Errors.maxError(maxAmount.toString(), inputAsset.symbol),
      });
      setTokenPrices({ input: "0", output: "0" });
      setAmount(IOType.output, "");
      return;
    }
  }, [
    inputAmount,
    minAmount,
    maxAmount,
    inputAsset,
    setError,
    setTokenPrices,
    handleInputAmountChange,
    setAmount,
  ]);

  useEffect(() => {
    if (isInsufficientBalance) {
      setError({ insufficientBalanceError: Errors.insufficientBalance });
      return;
    }
    setError({ insufficientBalanceError: Errors.none });
  }, [isInsufficientBalance, setError, inputAsset, outputAsset, inputAmount]);

  return {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    tokenPrices,
    rate,
    error,
    isEditAddress,
    loading: isFetchingQuote,
    validSwap,
    isSwapping,
    isApproving,
    isBitcoinSwap,
    inputTokenBalance,
    needsWalletConnection,
    controller,
    isComparisonVisible,
    swapAssets,
    handleInputAmountChange,
    handleOutputAmountChange,
    handleSwapClick,
    setAsset,
    clearSwapState,
    setIsComparisonVisible,
  };
};
