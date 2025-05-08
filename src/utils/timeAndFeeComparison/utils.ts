import { Asset } from "@gardenfi/orderbook";
import { API_URLS, ASSET_MAPPINGS, AssetMappingType } from "./constants";
import { Chain, Asset as ChainflipAsset } from "@chainflip/sdk/swap";
import axios from "axios";

export type ThorRoute = {
  providers: string[];
  expectedBuyAmount: string;
  meta: {
    assets: Array<{
      asset: string;
      price: number;
    }>;
  };
  fees: Array<{
    amount: string;
    asset: string;
  }>;
  estimatedTime: {
    total: number;
  };
};

export type ThorSwapAsset = {
  asset: string;
  price: number;
};

export type ThorSwapEstimatedTime = {
  total: number;
};

export type ThorSwapRoute = {
  expectedBuyAmount: string;
  meta: {
    assets: ThorSwapAsset[];
  };
  estimatedTime: ThorSwapEstimatedTime;
};

export type ThorSwapResponse = {
  routes: ThorSwapRoute[];
};

export type ChainflipAssetAndChain = {
  chain: Chain;
  asset: ChainflipAsset;
};

type ChainflipFeeDetail = {
  amount: string;
} & ChainflipAssetAndChain;

type ChainflipPoolInfo = {
  baseAsset: ChainflipAssetAndChain;
  quoteAsset: ChainflipAssetAndChain;
  fee: ChainflipFeeDetail;
};

type ChainflipIncludedFee = {
  type: "INGRESS" | "NETWORK" | "EGRESS" | "BROKER" | "BOOST";
} & ChainflipFeeDetail;

type ChainflipIncludedFeeResponse = ChainflipIncludedFee[];
type ChainflipPoolInfoResponse = ChainflipPoolInfo[];

export const formatTime = (totalSeconds: number | string): string => {
  const sec = Number(totalSeconds);
  if (isNaN(sec)) return "-";

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = (sec % 60).toFixed(0);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
};

export const parseTime = (time: string | undefined) => {
  if (!time) return 0;
  const cleanedTime = time.replace("~", "").trim();
  const match = cleanedTime.match(/(?:(\d+)m)?\s*(?:(\d+)s)?/);

  if (!match) return 0;
  const minutes = match[1] ? parseInt(match[1]) : 0;
  const seconds = match[2] ? parseInt(match[2]) : 0;

  return minutes * 60 + seconds;
};

export const formatTimeDiff = (time: number, gardenSwapTime: string) => {
  const diff = time - parseTime(gardenSwapTime);
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}${formatTime(Math.abs(diff))}`;
};

export const getFormattedAsset = (asset: Asset, type: AssetMappingType) =>
  ASSET_MAPPINGS[type]?.[`${asset.chain}:${asset.symbol}`];

export const getAssetPriceInUSD = async (assetIds: string[]) => {
  try {
    const { data } = await axios.get(API_URLS.coingecko, {
      params: { ids: assetIds.join(","), vs_currencies: "usd" },
    });
    return data;
  } catch {
    return { fee: "-", time: "-" };
  }
};

export const calculateChainflipFee = async (
  includedFee: ChainflipIncludedFeeResponse,
  poolInfo: ChainflipPoolInfoResponse
) => {
  const prices = await getAssetPriceInUSD(["bitcoin", "ethereum", "usd-coin"]);
  const feeMap: Record<string, number> = {
    ETH: 0,
    BTC: 0,
    USDC: 0,
  };

  includedFee.forEach((fee) => {
    if (fee.asset in feeMap) {
      feeMap[fee.asset] += parseFloat(fee.amount);
    }
  });

  const poolFee = poolInfo[0].fee;
  if (poolFee && poolFee.asset in feeMap) {
    feeMap[poolFee.asset] += parseFloat(poolFee.amount);
  }

  const normalizationFactors: Record<string, number> = {
    ETH: 1e18,
    BTC: 1e8,
    USDC: 1e6,
  };

  Object.keys(feeMap).forEach((key) => {
    feeMap[key] /= normalizationFactors[key];
  });

  const assetPrices: Record<string, number> = {
    ETH: prices.ethereum.usd ?? 0,
    BTC: prices.bitcoin.usd ?? 0,
    USDC: prices["usd-coin"].usd ?? 1,
  };

  const totalFeeInUsd = Object.keys(feeMap).reduce(
    (sum, key) => sum + feeMap[key] * assetPrices[key],
    0
  );

  return Number(totalFeeInUsd.toFixed(2));
};
