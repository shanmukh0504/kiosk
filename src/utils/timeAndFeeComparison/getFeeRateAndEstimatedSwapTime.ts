import { Asset, isBitcoin } from "@gardenfi/orderbook";
import axios from "axios";
import BigNumber from "bignumber.js";
import {
  API_URLS,
  BTC_MAINNET_CHAIN_ID,
  BTC_MAINNET_RECIPIENT,
  BTC_TESTNET_CHAIN_ID,
  BTC_TESTNET_RECIPIENT,
  EVM_DEAD_ADDRESS,
  RELAY_BTC_SWAP_TIME,
  SwapPlatform,
} from "./constants";
import {
  getFormattedAsset,
  calculateChainflipFee,
  ChainflipAssetAndChain,
  ThorSwapResponse,
  ThorSwapRoute,
  ThorSwapAsset,
} from "./utils";

export type comparisonMetric = { fee: number; time: number };

//ThorSwap
export const getThorFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
): Promise<comparisonMetric> => {
  const sellFormat = getFormattedAsset(srcAsset, SwapPlatform.THORSWAP);
  const buyFormat = getFormattedAsset(destAsset, SwapPlatform.THORSWAP);

  if (!sellFormat || !buyFormat) {
    return { fee: 0, time: 0 };
  }

  try {
    const { data: result } = await axios.post<ThorSwapResponse>(
      API_URLS.thorSwap,
      {
        sellAsset: sellFormat,
        buyAsset: buyFormat,
        sellAmount: amount.toString(),
        sourceAddress: "",
        destinationAddress: "",
        affiliate: "t",
        affiliateFee: 50,
        slippage: 3,
        includeTx: true,
        cfBoost: false,
      },
      {
        timeout: 10000,
        headers: {
          "X-Api-Key": "3974e4d9-f662-4e6e-a5b6-d44881902dcb",
          "X-Version": "2",
          "Content-Type": "application/json",
        },
      }
    );

    const bestProvider = result.routes.reduce(
      (best: ThorSwapRoute, current: ThorSwapRoute) => {
        const bestAmount = parseFloat(best.expectedBuyAmount);
        const currentAmount = parseFloat(current.expectedBuyAmount);
        return currentAmount > bestAmount ? current : best;
      },
      result.routes[0]
    );

    const inputAssetsFormatted = getFormattedAsset(
      srcAsset,
      SwapPlatform.THORSWAP
    );
    const outputAssetsFormatted = getFormattedAsset(
      destAsset,
      SwapPlatform.THORSWAP
    );

    const inputTokenMeta = bestProvider.meta.assets.find(
      (asset: ThorSwapAsset) => asset.asset === inputAssetsFormatted
    );
    const outputTokenMeta = bestProvider.meta.assets.find(
      (asset: ThorSwapAsset) => asset.asset === outputAssetsFormatted
    );

    const inputValue = new BigNumber(amount)
      .multipliedBy(inputTokenMeta?.price ?? 0)
      .toNumber();

    const outputValue = new BigNumber(bestProvider.expectedBuyAmount)
      .multipliedBy(outputTokenMeta?.price ?? 0)
      .toNumber();

    const fee = inputValue - outputValue;
    const swapDuration = bestProvider.estimatedTime.total;

    return {
      fee,
      time: swapDuration,
    };
  } catch {
    return { fee: 0, time: 0 };
  }
};

//Relay
export const getRelayFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
): Promise<comparisonMetric> => {
  const srcFormat = getFormattedAsset(srcAsset, SwapPlatform.RELAY) as {
    chainId: string;
    currency: string;
  };
  const destFormat = getFormattedAsset(destAsset, SwapPlatform.RELAY) as {
    chainId: string;
    currency: string;
  };

  if (!srcFormat || !destFormat) {
    return { fee: 0, time: 0 };
  }

  const user =
    srcFormat.chainId !== BTC_MAINNET_CHAIN_ID &&
    srcFormat.chainId != BTC_TESTNET_CHAIN_ID
      ? EVM_DEAD_ADDRESS
      : srcFormat.chainId === BTC_TESTNET_CHAIN_ID
        ? BTC_TESTNET_RECIPIENT
        : BTC_MAINNET_RECIPIENT;

  const recipient =
    destFormat.chainId !== BTC_MAINNET_CHAIN_ID &&
    destFormat.chainId != BTC_TESTNET_CHAIN_ID
      ? EVM_DEAD_ADDRESS
      : destFormat.chainId === BTC_TESTNET_CHAIN_ID
        ? BTC_TESTNET_RECIPIENT
        : BTC_MAINNET_RECIPIENT;

  const sendAmount = new BigNumber(amount)
    .multipliedBy(10 ** srcAsset.decimals)
    .toFixed();

  const requestBody = {
    user,
    originChainId: srcFormat.chainId,
    destinationChainId: destFormat.chainId,
    originCurrency: srcFormat.currency,
    recipient,
    destinationCurrency: destFormat.currency,
    amount: sendAmount,
    tradeType: "EXACT_INPUT",
  };

  try {
    const { data } = await axios.post(API_URLS.relay, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    if (!data.fees) return { fee: 0, time: 0 };

    const totalFee =
      Number(data.details.currencyIn.amountUsd) -
      Number(data.details.currencyOut.amountUsd);
    let time = data.details.timeEstimate;

    if (isBitcoin(srcAsset.chain) || isBitcoin(destAsset.chain))
      time = RELAY_BTC_SWAP_TIME;

    return { fee: totalFee, time };
  } catch {
    return { fee: 0, time: 0 };
  }
};

//Chainflip
export const getChainflipFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
): Promise<comparisonMetric> => {
  if (!srcAsset || !destAsset) {
    return { fee: 0, time: 0 };
  }

  const srcFormat = getFormattedAsset(
    srcAsset,
    SwapPlatform.CHAINFLIP
  ) as ChainflipAssetAndChain;
  const destFormat = getFormattedAsset(
    destAsset,
    SwapPlatform.CHAINFLIP
  ) as ChainflipAssetAndChain;

  if (!srcFormat || !destFormat) {
    return { fee: 0, time: 0 };
  }

  const sendAmount = (
    amount * (srcFormat.asset === "BTC" ? 1e8 : 1e6)
  ).toString();

  const quoteRequest = {
    amount: sendAmount,
    srcChain: srcFormat.chain,
    srcAsset: srcFormat.asset,
    destChain: destFormat.chain,
    destAsset: destFormat.asset,
    isVaultSwap: false,
    dcaEnabled: true,
  };

  try {
    const quoteData = await axios.get(API_URLS.chainflip, {
      params: quoteRequest,
    });
    const { includedFees, estimatedDurationSeconds, poolInfo } =
      quoteData.data[0];
    const totalFeeInUsd = await calculateChainflipFee(includedFees, poolInfo);
    return {
      fee: totalFeeInUsd,
      time: estimatedDurationSeconds,
    };
  } catch {
    return { fee: 0, time: 0 };
  }
};
