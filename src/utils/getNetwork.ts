import { Chain } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";

export const getNetwork = (chain: Chain) => {
  const { assetsData } = assetInfoStore();
  if (!assetsData) return;
  return assetsData[chain];
};
