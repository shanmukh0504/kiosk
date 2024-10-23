import { INTERNAL_ROUTES, THEMES } from "../constants/constants";
import { AssetData } from "../store/assetInfoStore";
import { Asset, Chain } from "@gardenfi/orderbook";

export const isProduction = () => {
  return import.meta.env.VITE_ENVIRONMENT === "production";
};

export const getCurrentTheme = () => {
  const path = window.location.pathname;
  if (path === INTERNAL_ROUTES.swap.path) return THEMES.swap;
  if (path === INTERNAL_ROUTES.quests.path) return THEMES.quests;
  throw new Error("Invalid theme");
};

export const constructAsset = (asset: AssetData, chain: Chain) => {
  const data: Asset = {
    logo: asset.logo,
    symbol: asset.symbol,
    name: asset.name,
    decimals: asset.decimals,
    chain,
    atomicSwapAddress: asset.atomicSwapAddress,
    tokenAddress: asset.tokenAddress,
  };
  return data;
};

export const isBitcoin = (asset: Asset) => {
  return asset.symbol === "BTC";
};
