import { isBitcoin, Asset } from "@gardenfi/orderbook";
import { SOLANA_MAINNET_CHAIN_ID, SOLANA_MAINNET_RECIPIENT } from "./constants";
import {
  API_URLS,
  RELAY_BTC_SWAP_TIME,
  comparisonMetric,
  BTC_MAINNET_RECIPIENT,
  BTC_TESTNET_CHAIN_ID,
  BTC_TESTNET_RECIPIENT,
  EVM_DEAD_ADDRESS,
  SwapPlatform,
} from "./constants";
import { getFormattedAsset } from "./utils";
import axios from "axios";
import { BTC_MAINNET_CHAIN_ID } from "./constants";
import BigNumber from "bignumber.js";

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
      ? srcFormat.chainId !== SOLANA_MAINNET_CHAIN_ID
        ? EVM_DEAD_ADDRESS
        : SOLANA_MAINNET_RECIPIENT
      : srcFormat.chainId === BTC_TESTNET_CHAIN_ID
        ? BTC_TESTNET_RECIPIENT
        : BTC_MAINNET_RECIPIENT;

  const recipient =
    destFormat.chainId !== BTC_MAINNET_CHAIN_ID &&
    destFormat.chainId != BTC_TESTNET_CHAIN_ID
      ? destFormat.chainId !== SOLANA_MAINNET_CHAIN_ID
        ? EVM_DEAD_ADDRESS
        : SOLANA_MAINNET_RECIPIENT
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
