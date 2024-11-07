import BigNumber from "bignumber.js";
import { INTERNAL_ROUTES, THEMES } from "../constants/constants";
import { Assets } from "../store/assetInfoStore";
import { Swap } from "@gardenfi/orderbook";

export const isProduction = () => {
  return import.meta.env.VITE_ENVIRONMENT === "production";
};

export const getCurrentTheme = () => {
  const path = window.location.pathname;
  if (path === INTERNAL_ROUTES.swap.path) return THEMES.swap;
  if (path === INTERNAL_ROUTES.quests.path) return THEMES.quests;
  throw new Error("Invalid theme");
};

/**
 * Gets the {Asset} from assets in store using the swap object
 * @param {Swap} swap
 * @returns
 */
export const getAssetFromSwap = (swap: Swap, assets: Assets | null) => {
  return assets && assets[`${swap.chain}_${swap.asset.toLowerCase()}`];
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
  return "just now";
};

export const formatAmount = (
  amount: string | number,
  decimals: number,
  toFixed = 4
) => {
  const bigAmount = new BigNumber(amount);
  const temp = bigAmount
    .dividedBy(10 ** decimals)
    .toFixed(toFixed, BigNumber.ROUND_DOWN);
  return Number(temp);
};
