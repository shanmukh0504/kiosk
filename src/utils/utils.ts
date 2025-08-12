import BigNumber from "bignumber.js";
import { INTERNAL_ROUTES, QUERY_PARAMS, THEMES } from "../constants/constants";
import { Assets } from "../store/assetInfoStore";
import { Asset, Swap } from "@gardenfi/orderbook";

export const isProduction = () => {
  return import.meta.env.VITE_ENVIRONMENT === "production";
};

export const getCurrentTheme = () => {
  const path = window.location.pathname.replace(/\/+$/, "");

  if (INTERNAL_ROUTES.swap.path.includes(path)) return THEMES.swap;
  if (INTERNAL_ROUTES.stake.path.includes(path)) return THEMES.stake;

  return THEMES.swap;
};

export const capitalizeChain = (chainKey: string) => {
  if (chainKey === "evm") return "EVM";
  return chainKey.charAt(0).toUpperCase() + chainKey.slice(1);
};

/**
 * Gets the {Asset} from assets in store using the swap object
 * @param {Swap} swap
 * @returns
 */
export const getAssetFromSwap = (swap: Swap, assets: Assets | null) => {
  return assets && assets[`${swap.chain}_${swap.asset.toLowerCase()}`];
};

export const getQueryParams = (urlParams: URLSearchParams) => {
  return {
    inputChain: urlParams.get(QUERY_PARAMS.inputChain),
    inputAssetSymbol: urlParams.get(QUERY_PARAMS.inputAsset),
    outputChain: urlParams.get(QUERY_PARAMS.outputChain),
    outputAssetSymbol: urlParams.get(QUERY_PARAMS.outputAsset),
    inputAmount: urlParams.get(QUERY_PARAMS.inputAmount),
  };
};

export const getDayDifference = (date: string) => {
  const now = new Date();
  const differenceInMs = now.getTime() - new Date(date).getTime();
  const dayDifference = Math.floor(differenceInMs / (1000 * 3600 * 24));
  const hourDifference = Math.floor(differenceInMs / (1000 * 3600));
  const minuteDifference = Math.floor(differenceInMs / (1000 * 60));

  if (dayDifference > 3) return `on ${new Date(date).toLocaleDateString()}`;
  if (dayDifference > 0)
    return `${dayDifference} day${dayDifference > 1 ? "s" : ""} ago`;
  if (hourDifference > 0)
    return `${hourDifference} hour${hourDifference > 1 ? "s" : ""} ago`;
  if (minuteDifference > 0)
    return `${minuteDifference} minute${minuteDifference > 1 ? "s" : ""} ago`;
  return "Just now";
};

export const formatAmount = (
  amount: string | number | bigint,
  decimals: number,
  toFixed?: number
) => {
  const bigAmount = new BigNumber(amount);
  if (bigAmount.isZero()) return 0;

  const value = bigAmount.dividedBy(10 ** decimals);
  const precision = toFixed ? toFixed : Number(value) > 10000 ? 2 : 4;
  let temp = value.toFixed(precision, BigNumber.ROUND_DOWN);

  while (
    temp
      .split(".")[1]
      ?.split("")
      .every((d) => d === "0") &&
    temp.split(".")[1].length < 8
  ) {
    temp = value.toFixed(temp.split(".")[1].length + 2, BigNumber.ROUND_DOWN);
  }

  return Number(temp);
};

export const isCurrentRoute = (route: string) =>
  window.location.pathname === route;

export const clearLocalStorageExcept = (keysToKeep: string[]) => {
  const preservedData: Record<string, string | null> = {};

  keysToKeep.forEach((key) => {
    preservedData[key] = localStorage.getItem(key);
  });

  localStorage.clear();

  keysToKeep.forEach((key) => {
    if (preservedData[key] !== null) {
      localStorage.setItem(key, preservedData[key] as string);
    }
  });
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const toXOnly = (pubKey: string) =>
  pubKey.length === 64 ? pubKey : pubKey.slice(2);

export const starknetAddressToXOnly = (address: string) => {
  const xOnly = address.slice(2);
  const trimmed = xOnly.replace(/^0+/, "");
  return `0x${trimmed}`;
};

export const getAssetFromChainAndSymbol = (
  assets: Assets,
  chain: string | null,
  assetSymbol: string | null
) => {
  const assetKey = Object.keys(assets).find((key) => {
    const asset = assets[key];
    return asset.chain === chain && asset.symbol === assetSymbol;
  });
  return assetKey ? assets[assetKey] : undefined;
};

export const getOrderPair = (
  chain: string | null,
  tokenAddress: string | null
) => (chain && tokenAddress ? `${chain}_${tokenAddress.toLowerCase()}` : "");

export const getAssetChainHTLCAddressPair = (asset: Asset) =>
  `${asset.chain}_${asset.atomicSwapAddress.toLowerCase()}`;

export const getProtocolFee = (fees: number) => {
  const protocolBips = 7;
  const totalBips = 30;
  const protocolFee = fees * (protocolBips / totalBips);
  return protocolFee;
};
