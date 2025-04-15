import { Network } from "@gardenfi/utils";
import { network } from "../../constants/constants";
import {
  Assets,
  Chain,
  Chains,
  Asset as ChainflipAsset,
} from "@chainflip/sdk/swap";

export enum SwapPlatform {
  THORSWAP = "thorswap",
  CHAINFLIP = "chainflip",
  RELAY = "relay",
}

export type AssetMappings = {
  [SwapPlatform.THORSWAP]: Record<string, string>;
  [SwapPlatform.RELAY]: Record<string, { chainId: string; currency: string }>;
  [SwapPlatform.CHAINFLIP]: Record<
    string,
    { chain: Chain; asset: ChainflipAsset }
  >;
};

export type AssetMappingType = keyof AssetMappings;

export const API_URLS = {
  thorSwap: "https://api.thorswap.net/aggregator/tokens/quote",
  relay:
    network === Network.MAINNET
      ? "https://api.relay.link/quote"
      : "https://api.testnets.relay.link/quote",
  coingecko: "https://api.coingecko.com/api/v3/simple/price",
  chainflip: "https://chainflip-swap.chainflip.io/v2/quote"
};

export const RELAY_BTC_SWAP_TIME = 1200; //in seconds

export const ASSET_MAPPINGS: AssetMappings = {
  [SwapPlatform.THORSWAP]: {
    "bitcoin:BTC": "BTC.BTC",
    "ethereum:USDC": "ETH.USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "ethereum:WBTC": "ETH.WBTC-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  },
  [SwapPlatform.RELAY]: {
    "bitcoin:BTC": {
      chainId: "8253038",
      currency: "bc1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmql8k8",
    },
    "bitcoin_testnet:BTC": {
      chainId: "9092725",
      currency: "tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqtlc5af",
    },
    "ethereum:WBTC": {
      chainId: "1",
      currency: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    },
    "ethereum:USDC": {
      chainId: "1",
      currency: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    "ethereum:cbBTC": {
      chainId: "1",
      currency: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    },
    "base:USDC": {
      chainId: "8453",
      currency: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    },
    "base:cbBTC": {
      chainId: "8453",
      currency: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    },
    "arbitrum:WBTC": {
      chainId: "42161",
      currency: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    },
    "arbitrum:USDC": {
      chainId: "42161",
      currency: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    },
  },
  [SwapPlatform.CHAINFLIP]: {
    "bitcoin:BTC": { chain: Chains.Bitcoin, asset: Assets.BTC },
    "bitcoin_testnet:BTC": { chain: Chains.Bitcoin, asset: Assets.BTC },
    "ethereum:USDC": { chain: Chains.Ethereum, asset: Assets.USDC },
    "ethereum_sepolia:WBTC": { chain: Chains.Ethereum, asset: Assets.ETH },
    "arbitrum:USDC": { chain: Chains.Arbitrum, asset: Assets.USDC },
  },
};

export const EVM_DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";
export const BTC_MAINNET_RECIPIENT =
  "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa";
export const BTC_MAINNET_CHAIN_ID = "8253038";
export const BTC_TESTNET_CHAIN_ID = "9092725";
export const BTC_TESTNET_RECIPIENT =
  "tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqtlc5af";
