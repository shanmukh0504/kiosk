import axios from "axios";
import { API } from "../../../constants/api";
import { Asset, Chain } from "@gardenfi/orderbook";
import { Assets, Chains } from "../../../store/assetInfoStore";

export type Networks = {
  [chain in Chain]: ChainData;
};

export type ChainData = {
  chainId: number;
  explorer: string;
  networkLogo: string;
  networkType: string;
  name: string;
  identifier: Chain;
  assetConfig: Omit<Asset, "chain">[];
};

export const fetchAssetsData = async () => {
  try {
    const res = await axios.get<{
      data: { networks: Networks };
    }>(API().data.assets);
    const assetsData = res.data.data.networks;

    const assets: Assets = {};
    const chains: Chains = {};

    for (const chainInfo of Object.values(assetsData)) {
      chains[chainInfo.identifier] = {
        chainId: chainInfo.chainId,
        explorer: chainInfo.explorer,
        networkLogo: chainInfo.networkLogo,
        networkType: chainInfo.networkType,
        name: chainInfo.name,
        identifier: chainInfo.identifier,
      };
      for (const asset of chainInfo.assetConfig) {
        assets[`${chainInfo.identifier}_${asset.atomicSwapAddress}`] = {
          ...asset,
          chain: chainInfo.identifier,
        };
      }
    }
    return { assets, chains };
  } catch (error) {
    throw new Error("Failed to fetch assets data");
  }
};
