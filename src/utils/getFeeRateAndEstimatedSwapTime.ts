import { Asset, isBitcoin } from "@gardenfi/orderbook";
import {
  Chains,
  Assets,
  SwapSDK,
  Chain,
  Asset as ChainflipAsset,
  ChainflipNetwork,
} from "@chainflip/sdk/swap";
import axios from "axios";
import { Network } from "@gardenfi/utils";
import { network } from "../constants/constants";

type AssetMappings = {
  thor: Record<string, string>;
  relay: Record<string, { chainId: string; currency: string }>;
  chainflip: Record<string, { chain: Chain; asset: ChainflipAsset }>;
};

type AssetMappingType = keyof AssetMappings;

const API_URLS = {
  thorSwap: "https://api.thorswap.net/aggregator/tokens/quote",
  relay:
    network === Network.MAINNET
      ? "https://api.relay.link/quote"
      : "https://api.testnets.relay.link/quote",
  coingecko: "https://api.coingecko.com/api/v3/simple/price",
};

const ASSET_MAPPINGS: AssetMappings = {
  thor: {
    "bitcoin:BTC": "BTC.BTC",
    "ethereum:USDC": "ETH.USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "ethereum:WBTC": "ETH.WBTC-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  },
  relay: {
    "bitcoin:BTC": {
      chainId: "8253038",
      currency: "bc1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmql8k8",
    },
    "bitcoin_testnet:BTC": {
      chainId: "9092725",
      currency: "tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqtlc5af",
    },
    "ethereum:WBTC": {
      chainId: "1",
      currency: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    },
    "ethereum:USDC": {
      chainId: "1",
      currency: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    "ethereum:cbBTC": {
      chainId: "1",
      currency: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    },
    "base:USDC": {
      chainId: "8453",
      currency: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    },
    "base:cbBTC": {
      chainId: "8453",
      currency: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    },
    "base_sepolia:USDC": {
      chainId: "84532",
      currency: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
    },
    "ethereum_sepolia:USDC": {
      chainId: "11155111",
      currency: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
    },
    "arbitrum:WBTC": {
      chainId: "42161",
      currency: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    },
    "arbitrum:USDC": {
      chainId: "42161",
      currency: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    },
  },
  chainflip: {
    "bitcoin:BTC": { chain: Chains.Bitcoin, asset: Assets.BTC },
    "bitcoin_testnet:BTC": { chain: Chains.Bitcoin, asset: Assets.BTC },
    "ethereum:USDC": { chain: Chains.Ethereum, asset: Assets.USDC },
    "ethereum_sepolia:WBTC": { chain: Chains.Ethereum, asset: Assets.ETH },
    "arbitrum:USDC": { chain: Chains.Arbitrum, asset: Assets.USDC },
  },
};

const formatTime = (seconds: number | string) => {
  if (typeof seconds !== "number" || isNaN(seconds)) return "-";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const getFormattedAsset = (asset: Asset, type: AssetMappingType) =>
  ASSET_MAPPINGS[type]?.[`${asset.chain}:${asset.symbol}`];

export const getThorFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
) => {
  const sellFormat = getFormattedAsset(srcAsset, "thor");
  const buyFormat = getFormattedAsset(destAsset, "thor");
  if (!sellFormat || !buyFormat) {
    return { fee: "-", time: "-" };
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
    const inboundFee = route.fees?.THOR[0]?.totalFeeUSD ?? 0;
    const outboundFee = route.fees?.THOR[1]?.totalFeeUSD ?? 0;
    const duration = route.estimatedTime;

    return {
      fee: (inboundFee + outboundFee).toFixed(2),
      time: formatTime(duration),
    };
  } catch {
    return { fee: "-", time: "-" };
  }
};

export const getRelayFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
) => {
  const srcFormat = getFormattedAsset(srcAsset, "relay") as {
    chainId: string;
    currency: string;
  };
  const destFormat = getFormattedAsset(destAsset, "relay") as {
    chainId: string;
    currency: string;
  };

  if (!srcFormat || !destFormat) {
    return { fee: "-", time: "-" };
  }

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user:
        srcFormat.chainId !== "8253038"
          ? "0x000000000000000000000000000000000000dead"
          : "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa",
      originChainId: srcFormat.chainId,
      destinationChainId: destFormat.chainId,
      originCurrency: srcFormat.currency,
      recipient:
        destFormat.chainId === "8253038"
          ? "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa"
          : "0x000000000000000000000000000000000000dead",
      destinationCurrency: destFormat.currency,
      amount: amount * 10 ** srcAsset.decimals,
      tradeType: "EXACT_INPUT",
    }),
  };

  try {
    const response = await fetch(API_URLS.relay, options);
    const data = await response.json();

    if (!data.fees) return { fee: "-", time: "-" };

    const gasFee = Number(data.fees?.gas?.amountUsd) || 0;
    const relayerFee = Number(data.fees?.relayer?.amountUsd) || 0;
    const relayerGasFee = Number(data.fees?.relayerGas?.amountUsd) || 0;
    const relayerServiceFee =
      Number(data.fees?.relayerServiceFee?.amountUsd) || 0;

    const totalFee = gasFee + relayerFee + relayerGasFee + relayerServiceFee;
    let time = formatTime(data.details?.timeEstimate);

    if (isBitcoin(srcAsset.chain) || isBitcoin(destAsset.chain)) time = "~20m";

    return { fee: totalFee.toFixed(2), time };
  } catch {
    return { fee: "-", time: "-" };
  }
};

const getAssetPriceInUSD = async (assetIds: string[]) => {
  try {
    const { data } = await axios.get(API_URLS.coingecko, {
      params: { ids: assetIds.join(","), vs_currencies: "usd" },
    });
    return data;
  } catch {
    return { fee: "-", time: "-" };
  }
};

export const getChainflipFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
) => {
  if (!srcAsset || !destAsset) {
    return {};
  }

  const srcFormat = getFormattedAsset(srcAsset, "chainflip") as {
    chain: Chain;
    asset: ChainflipAsset;
  };
  const destFormat = getFormattedAsset(destAsset, "chainflip") as {
    chain: Chain;
    asset: ChainflipAsset;
  };

  if (!srcFormat || !destFormat) {
    return { fee: "-", time: "-" };
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
    const prices = await getAssetPriceInUSD([
      "bitcoin",
      "ethereum",
      "usd-coin",
    ]);

    let totalEthFee = 0;
    let totalBtcFee = 0;
    let totalUsdcFee = 0;

    includedFees.forEach((fee) => {
      if (fee.asset === "ETH") {
        totalEthFee += parseFloat(fee.amount);
      } else if (fee.asset === "BTC") {
        totalBtcFee += parseFloat(fee.amount);
      } else if (fee.asset === "USDC") {
        totalUsdcFee += parseFloat(fee.amount);
      }
    });

    if (poolInfo && poolInfo.length > 0) {
      const poolFee = poolInfo[0].fee;
      if (poolFee.asset === "BTC") {
        totalBtcFee += parseFloat(poolFee.amount);
      }
    }

    totalEthFee /= 1e18;
    totalBtcFee /= 1e8;
    totalUsdcFee /= 1e6;

    const ethPriceInUsd = prices.ethereum?.usd ?? 0;
    const btcPriceInUsd = prices.bitcoin?.usd ?? 0;
    const usdcPriceInUsd = prices["usd-coin"]?.usd ?? 1;

    const totalFeeInUsd =
      totalEthFee * ethPriceInUsd +
      totalBtcFee * btcPriceInUsd +
      totalUsdcFee * usdcPriceInUsd;

    return {
      fee: totalFeeInUsd.toFixed(2),
      time: formatTime(estimatedDurationSeconds),
    };
  } catch {
    return { fee: "-", time: "-" };
  }
};
