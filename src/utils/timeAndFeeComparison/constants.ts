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

export type ChainflipAssetInfo = {
  chain: string;
  asset: string;
};

export type ChainflipFeeDetail = {
  type: "INGRESS" | "NETWORK" | "BROKER" | "EGRESS" | "BOOST";
  chain: string;
  asset: string;
  amount: string;
};

export type ChainflipPoolInfo = {
  baseAsset: ChainflipAssetInfo;
  quoteAsset: ChainflipAssetInfo;
  fee: {
    chain: string;
    asset: string;
    amount: string;
  };
};

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

export type ChainflipEstimatedDurations = {
  swap: number;
  deposit: number;
  egress: number;
};

export type ChainflipBoostQuote = {
  intermediateAmount: string;
  egressAmount: string;
  recommendedSlippageTolerancePercent: number;
  includedFees: ChainflipFeeDetail[];
  lowLiquidityWarning: boolean;
  poolInfo: ChainflipPoolInfo[];
  estimatedDurationsSeconds: ChainflipEstimatedDurations;
  estimatedDurationSeconds: number;
  estimatedPrice: string;
  type: string;
  srcAsset: ChainflipAssetInfo;
  destAsset: ChainflipAssetInfo;
  depositAmount: string;
  isVaultSwap: boolean;
  estimatedBoostFeeBps: number;
  maxBoostFeeBps: number;
};

export type ChainflipQuote = {
  intermediateAmount: string;
  egressAmount: string;
  recommendedSlippageTolerancePercent: number;
  includedFees: ChainflipFeeDetail[];
  lowLiquidityWarning: boolean;
  poolInfo: ChainflipPoolInfo[];
  estimatedDurationsSeconds: ChainflipEstimatedDurations;
  estimatedDurationSeconds: number;
  estimatedPrice: string;
  type: string;
  srcAsset: ChainflipAssetInfo;
  destAsset: ChainflipAssetInfo;
  depositAmount: string;
  isVaultSwap: boolean;
  boostQuote?: ChainflipBoostQuote;
};

export type AssetMappings = {
  [SwapPlatform.THORSWAP]: Record<string, string>;
  [SwapPlatform.RELAY]: Record<string, { chainId: string; currency: string }>;
  [SwapPlatform.CHAINFLIP]: Record<
    string,
    {
      chain: Chain;
      asset: ChainflipAsset;
      htlc_address: string;
      address: string;
    }
  >;
};

export type comparisonMetric = { fee: number; time: number };

export type AssetMappingType = keyof AssetMappings;

export const API_URLS = {
  thorSwap: "https://api.swapkit.dev/quote",
  relay:
    network === Network.MAINNET
      ? "https://api.relay.link/quote"
      : "https://api.testnets.relay.link/quote",
  chainflip: "https://chainflip-swap.chainflip.io/v2/quote",
  fiatValue: "https://cache-service.chainflip.io/graphql",
};

export const RELAY_BTC_SWAP_TIME = 1200; //in seconds

export const ASSET_MAPPINGS: AssetMappings = {
  [SwapPlatform.THORSWAP]: {
    "bitcoin:BTC": "BTC.BTC",
    "arbitrum:USDC": "ARB.USDC-0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "ethereum:ETH": "ETH.ETH",
    "ethereum:USDC": "ETH.USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "ethereum:WBTC": "ETH.WBTC-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "ethereum:cbBTC": "ETH.cbBTC-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    "base:USDC": "BASE.USDC-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    "base:cbBTC": "BASE.CBBTC-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    "bnbchain:BNB": "BSC.BNB",
    "bnbchain:BTCB": "BSC.BTCB-0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    "bnbchain:USDC": "BSC.USDC-0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    "solana:SOL": "SOL.SOL",
    "solana:USDC": "SOL.USDC-EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "solana:cbBTC": "SOL.cbBTC-cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
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
    "ethereum:ETH": {
      chainId: "1",
      currency: "0x0000000000000000000000000000000000000000",
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
    "solana:cbBTC": {
      chainId: "792703809",
      currency: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
    },
    "solana:SOL": {
      chainId: "792703809",
      currency: "11111111111111111111111111111111",
    },
    "solana:USDC": {
      chainId: "792703809",
      currency: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    "corn:BTCN": {
      chainId: "21000000",
      currency: "0x0000000000000000000000000000000000000000",
    },
    "unichain:USDC": {
      chainId: "130",
      currency: "0x078d782b760474a361dda0af3839290b0ef57ad6",
    },
    "unichain:WBTC": {
      chainId: "130",
      currency: "0x0555e30da8f98308edb960aa94c0db47230d2b9c",
    },
    "bnbchain:BTCB": {
      chainId: "56",
      currency: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    },
    "bnbchain:USDC": {
      chainId: "56",
      currency: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580",
    },
    "hyperevm:uBTC": {
      chainId: "999",
      currency: "0x9fdbda0a5e284c32744d2f17ee5c74b284993463",
    },
  },
  [SwapPlatform.CHAINFLIP]: {
    "ethereum:ETH": {
      chain: Chains.Ethereum,
      asset: Assets.ETH,
      htlc_address: "0x1ac7A0ebf13a996D5915e212900bE2d074f94988",
      address: "0x0000000000000000000000000000000000000000",
    },
    "bitcoin:BTC": {
      chain: Chains.Bitcoin,
      asset: Assets.BTC,
      htlc_address: "primary",
      address: "0x0000000000000000000000000000000000000000",
    },
    "ethereum:USDC": {
      chain: Chains.Ethereum,
      asset: Assets.USDC,
      htlc_address: "0xD8a6E3FCA403d79b6AD6216b60527F51cc967D39",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    "arbitrum:USDC": {
      chain: Chains.Arbitrum,
      asset: Assets.USDC,
      htlc_address: "0xeaE7721d779276eb0f5837e2fE260118724a2Ba4",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    },
    "solana:USDC": {
      chain: Chains.Solana,
      asset: Assets.USDC,
      htlc_address:
        "gdnvdMCHJgnidtU7SL8RkRshHPvDJU1pdfZEpoLvqdU_EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    "solana:SOL": {
      chain: Chains.Solana,
      asset: Assets.SOL,
      htlc_address: "primary",
      address: "0x0000000000000000000000000000000000000000",
    },
  },
};

export const EVM_DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";
export const BTC_MAINNET_RECIPIENT =
  "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa";
export const BTC_MAINNET_CHAIN_ID = "8253038";
export const BTC_TESTNET_CHAIN_ID = "9092725";
export const BTC_TESTNET_RECIPIENT =
  "tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqtlc5af";
export const SOLANA_MAINNET_CHAIN_ID = "792703809";
export const SOLANA_MAINNET_RECIPIENT =
  "CbKGgVKLJFb8bBrf58DnAkdryX6ubewVytn7X957YwNr";
