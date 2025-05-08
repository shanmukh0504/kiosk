import { Asset } from "@gardenfi/orderbook";
import {
  API_URLS,
  ASSET_MAPPINGS,
  AssetMappingType,
  SwapPlatform,
} from "./constants";
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
  htlc_address: string;
  address: string;
};

type ChainflipFeeDetail = {
  amount: string;
} & ChainflipAssetAndChain;

export type ChainflipPoolInfo = {
  baseAsset: ChainflipAssetAndChain;
  quoteAsset: ChainflipAssetAndChain;
  fee: ChainflipFeeDetail;
};

export type ChainflipIncludedFee = {
  type: "INGRESS" | "NETWORK" | "EGRESS" | "BROKER" | "BOOST";
} & ChainflipFeeDetail;

type ChainflipIncludedFeeResponse = ChainflipIncludedFee[];
type ChainflipPoolInfoResponse = ChainflipPoolInfo[];

export type AssetPriceInfo = {
  chain: string;
  htlc_address: string;
  token_price: number;
  asset: string;
};

export type PriceResponse = {
  status: string;
  result: AssetPriceInfo[];
};

export type ChainflipPriceResponse = {
  data: {
    tokenPrices: Array<{
      chainId: string;
      address: string;
      usdPrice: number;
    }>;
  };
};

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

export const getAssetPriceInUSD = async () => {
  try {
    const { data } = await axios.get(API_URLS.fiatValue);
    return data.result;
  } catch {
    return { fee: "-", time: "-" };
  }
};

export const calculateChainflipFee = async (
  includedFee: ChainflipIncludedFeeResponse,
  poolInfo: ChainflipPoolInfoResponse
) => {
  const prices = (await getAssetPriceInUSD()) as AssetPriceInfo[];
  const feeMap: Record<string, number> = {};

  // Create a mapping of HTLC addresses to token prices for Chainflip supported chains
  const chainflipSupportedChains = ["ethereum", "bitcoin", "arbitrum", "base"];
  const htlcPriceMap = new Map<string, number>();

  prices.forEach((price) => {
    if (chainflipSupportedChains.includes(price.chain)) {
      htlcPriceMap.set(price.htlc_address.toLowerCase(), price.token_price);
    }
  });

  // Process included fees
  includedFee.forEach((fee) => {
    const key = `${fee.chain}_${fee.asset}`;
    if (!feeMap[key]) {
      feeMap[key] = 0;
    }
    feeMap[key] += parseFloat(fee.amount);
  });

  // Process pool fee
  const poolFee = poolInfo[0].fee;
  if (poolFee) {
    const key = `${poolFee.chain}_${poolFee.asset}`;
    if (!feeMap[key]) {
      feeMap[key] = 0;
    }
    feeMap[key] += parseFloat(poolFee.amount);
  }

  // Normalize amounts based on HTLC addresses
  const normalizedFees: Record<string, number> = {};
  Object.entries(feeMap).forEach(([key, amount]) => {
    const [, asset] = key.split("_");
    let normalizationFactor = 1e18; // Default for ETH

    if (asset === "BTC") {
      normalizationFactor = 1e8;
    } else if (asset === "USDC") {
      normalizationFactor = 1e6;
    }

    normalizedFees[key] = amount / normalizationFactor;
  });

  let totalFeeInUsd = 0;
  Object.entries(normalizedFees).forEach(([key, amount]) => {
    const [chain, asset] = key.split("_");
    const assetKey = `${chain.toLowerCase()}:${asset}`;
    const assetMapping = ASSET_MAPPINGS[SwapPlatform.CHAINFLIP][assetKey];

    if (assetMapping) {
      const htlcAddress = assetMapping.htlc_address.toLowerCase();
      const price = htlcPriceMap.get(htlcAddress);

      if (price) {
        totalFeeInUsd += amount * price;
      }
    }
  });

  return Number(totalFeeInUsd.toFixed(2));
};
