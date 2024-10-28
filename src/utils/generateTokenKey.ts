import { Chain } from "@gardenfi/orderbook";

export const generateTokenKey = (chain: Chain, asset: string) => {
  return `${chain}_${asset.toLowerCase()}`;
};
