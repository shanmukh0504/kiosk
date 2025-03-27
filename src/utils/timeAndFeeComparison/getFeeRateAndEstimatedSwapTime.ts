import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { SwapSDK, ChainflipNetwork } from "@chainflip/sdk/swap";
import axios from "axios";
import { network } from "../../constants/constants";
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
  calculateThorFee,
  calculateRelayFee,
  calculateChainflipFee,
  ChainflipAssetAndChain,
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
    const result = await axios.get(API_URLS.thorSwap, {
      timeout: 5000,
      params: {
        sellAsset: sellFormat,
        buyAsset: buyFormat,
        sellAmount: amount,
      },
    });

    const route = result.data.routes[0];
    const thorFee = calculateThorFee(route.fees);
    const swapDuration = route.estimatedTime;

    return {
      fee: thorFee,
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

  const requestBody = {
    user,
    originChainId: srcFormat.chainId,
    destinationChainId: destFormat.chainId,
    originCurrency: srcFormat.currency,
    recipient,
    destinationCurrency: destFormat.currency,
    amount: amount * 10 ** srcAsset.decimals,
    tradeType: "EXACT_INPUT",
  };

  try {
    const { data } = await axios.post(API_URLS.relay, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    if (!data.fees) return { fee: 0, time: 0 };

    const totalFee = calculateRelayFee(data.fees);
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

  const quoteRequest = {
    srcChain: srcFormat.chain,
    destChain: destFormat.chain,
    srcAsset: srcFormat.asset,
    destAsset: destFormat.asset,
    amount: (amount * 1e8).toString(),
  };

  try {
    const swapSDK = new SwapSDK({ network: network as ChainflipNetwork });
    const quoteData = await swapSDK.getQuoteV2(quoteRequest);
    const { includedFees, estimatedDurationSeconds, poolInfo } =
      quoteData.quotes[0];
    const totalFeeInUsd = await calculateChainflipFee(includedFees, poolInfo);
    return {
      fee: totalFeeInUsd,
      time: estimatedDurationSeconds,
    };
  } catch {
    return { fee: 0, time: 0 };
  }
};
