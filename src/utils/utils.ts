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
  const path = window.location.pathname.replace(/\/+$/, "");

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
  amount: string | number | bigint,
  decimals: number,
  toFixed = 4
) => {
  const bigAmount = new BigNumber(amount);
  if (bigAmount.isZero()) return 0;

  const value = bigAmount.dividedBy(10 ** decimals);
  let temp = value.toFixed(toFixed, BigNumber.ROUND_DOWN);

  while (
    temp
      .split(".")[1]
      ?.split("")
      .every((d) => d === "0") &&
    temp.split(".")[1].length < 8
  ) {
    temp = value.toFixed(temp.split(".")[1].length + 1, BigNumber.ROUND_DOWN);
  }

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

// export const getFormattedAmountValue = (asset: Asset, amount: string | number): string => {
//   const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

//   if (isBitcoin(asset.chain)) {
//     // Format with 7 decimal places as base representation
//     const formattedWithSeven = numericAmount.toFixed(7);

//     // Split into integer and decimal parts
//     const [integerPart, decimalPart] = formattedWithSeven.split('.');

//     // Check for 4+ consecutive zeros in the decimal part
//     const match = decimalPart.match(/0{4,}/);

//     if (match) {
//       // Get the position where consecutive zeros start
//       const zeroPosition = match.index;

//       // Return only the digits before the consecutive zeros
//       if (zeroPosition === 0) {
//         // If zeros start immediately after decimal point, return just integer part
//         return integerPart;
//       } else {
//         // Otherwise truncate at the position where zeros start
//         return `${integerPart}.${decimalPart.substring(0, zeroPosition)}`;
//       }
//     }

//     // No 4+ consecutive zeros found, return full 7 decimal format
//     return formattedWithSeven;
//   } else {
//     const decimalPlaces = numericAmount >= 10000 ? 2 : 4;
//     return numericAmount.toFixed(decimalPlaces);
//   }
// };
