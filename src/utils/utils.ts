import BigNumber from "bignumber.js";
import {
  INTERNAL_ROUTES,
  LOCAL_STORAGE_KEYS,
  QUERY_PARAMS,
  THEMES,
} from "../constants/constants";
import { Assets } from "../store/assetInfoStore";
import { Swap } from "@gardenfi/orderbook";

export const isProduction = () => {
  return import.meta.env.VITE_ENVIRONMENT === "production";
};

export const getCurrentTheme = () => {
  const path = window.location.pathname;

  if (INTERNAL_ROUTES.swap.path.includes(path)) return THEMES.swap;
  if (INTERNAL_ROUTES.stake.path.includes(path)) return THEMES.stake;

  return THEMES.swap;
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
  amount: string | number,
  decimals: number,
  toFixed = 8
) => {
  const bigAmount = new BigNumber(amount);
  const temp = bigAmount
    .dividedBy(10 ** decimals)
    .toFixed(toFixed, BigNumber.ROUND_DOWN);
  return Number(temp);
};

export const isCurrentRoute = (route: string) =>
  window.location.pathname === route;

export const ClearLocalStorageExceptNotification = () => {
  const notificationId = localStorage.getItem(LOCAL_STORAGE_KEYS.notification);

  localStorage.clear();

  if (notificationId) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.notification, notificationId);
  }
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
