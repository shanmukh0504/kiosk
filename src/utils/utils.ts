import BigNumber from "bignumber.js";
import { INTERNAL_ROUTES, QUERY_PARAMS, THEMES } from "../constants/constants";
import {
  Asset,
  Chain,
  ChainAsset,
  isBitcoin,
  isEVM,
  isStarknet,
  isSolana,
  isSui,
  OrderWithStatus,
  Swap,
} from "@gardenfi/orderbook";
import { Assets } from "../store/assetInfoStore";

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
  if (!assets) return;
  return Object.values(assets).find(
    (asset) =>
      ChainAsset.from(asset.id).toString() ===
      ChainAsset.from(swap.asset).toString()
  );
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

// Intentionally returns a string here to avoid browsers showing tiny balances in scientific notation.
export const formatBigNumber = (
  amount: BigNumber,
  decimals: number,
  toFixed?: number
) => {
  const bigAmount = new BigNumber(amount).abs();
  if (bigAmount.isZero()) return 0;

  const value = new BigNumber(amount).dividedBy(10 ** decimals);
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
  return temp;
};

export const formatAmount = (
  amount: string | number | bigint,
  decimals: number,
  toFixed?: number
) => {
  const bigAmount = new BigNumber(amount);
  if (bigAmount.isZero()) return 0;
  return Number(formatBigNumber(bigAmount, decimals, toFixed));
};

export const formatBalance = (
  amount: string | number | bigint,
  decimals: number,
  toFixed?: number
) => {
  const bigAmount = new BigNumber(amount);
  if (bigAmount.isZero()) return "0";
  const balance = formatBigNumber(bigAmount, decimals, toFixed);

  // Preserve very small values as strings (not scientific notation) when they are <1
  // and effectively just a run of leading zeros after the decimal.
  return Number(balance) < 1 && /\.0{8,}/.test(balance.toString())
    ? Number(balance)
    : /\.0{6,}/.test(balance.toString())
      ? balance
      : Number(balance);
};

export const isCurrentRoute = (route: string) => {
  if (route.includes(":")) {
    const routePattern = route.replace(/:[^/]+/g, "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(window.location.pathname);
  }

  return window.location.pathname === route;
};

export const formatAmountUsd = (
  amount: string | number | bigint | undefined,
  decimals: number
) => {
  if (!amount) return 0;
  const num = formatAmount(amount, decimals);
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
};

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

export const getFirstAssetFromChain = (
  assets: Assets,
  chain: string | null
) => {
  if (!chain) return undefined;

  const assetKey = Object.keys(assets).find((key) => {
    const asset = assets[key];
    return asset.chain === chain;
  });

  return assetKey ? assets[assetKey] : undefined;
};

export const getProtocolFee = (fees: number) => {
  const protocolBips = 7;
  const totalBips = 30;
  const protocolFee = fees * (protocolBips / totalBips);
  return protocolFee;
};

export const getDaysUntilNextEpoch = (
  epochData: { epoch: string }[] | null
) => {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();
  const currentMinutes = now.getUTCMinutes();

  if (epochData && epochData.length > 0) {
    const lastEpoch = new Date(epochData[0].epoch);
    const nextEpoch = new Date(lastEpoch);
    nextEpoch.setDate(nextEpoch.getDate() + 7);

    const diffTime = nextEpoch.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (currentDay === 0 && currentHour === 0 && currentMinutes === 0) {
      return 7;
    }

    if (diffDays < 0 || currentDay === 0) {
      return 7;
    }

    return diffDays;
  }

  const daysUntilNextSunday = (7 - currentDay) % 7;
  return daysUntilNextSunday;
};

export function parseAssetNameSymbol(
  input: string | undefined,
  assetId?: string | ChainAsset,
  fallbackSymbol?: string
): { name: string; symbol: string } {
  const raw = (input ?? "").trim();
  if (!raw) return { name: "", symbol: fallbackSymbol?.trim() || "" };

  const parts = raw.split(":");
  if (parts.length >= 2) {
    const name = parts[0]?.trim() || "";
    const symbol =
      parts.slice(1).join(":").trim() || fallbackSymbol?.trim() || "";
    return { name, symbol };
  }

  let derivedSymbol = "";

  if (assetId) {
    try {
      const chainAsset =
        typeof assetId === "string" ? ChainAsset.from(assetId) : assetId;
      derivedSymbol = chainAsset.symbol.toUpperCase();
    } catch {
      /* empty */
    }
  }

  return { name: raw, symbol: derivedSymbol || fallbackSymbol?.trim() || "" };
}

export function sortPendingOrders(orders: OrderWithStatus[]) {
  return orders.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  });
}

export const isAsset = (
  asset: Asset | null | undefined,
  chain: Chain,
  symbol?: string
) => {
  if (!asset?.chain) return false;

  const chainMatches =
    asset.chain.toLowerCase() === chain.toString().toLowerCase();

  if (!chainMatches) return false;
  if (!symbol) return true;

  return asset?.symbol?.toUpperCase() === symbol.toUpperCase();
};

export const warningMessage = () => {
  if (typeof window !== "undefined") {
    const logo = `
  ░██████╗░░█████╗░██████╗░██████╗░███████╗███╗░░██╗
  ██╔════╝░██╔══██╗██╔══██╗██╔══██╗██╔════╝████╗░██║
  ██║░░██╗░███████║██████╔╝██║░░██║█████╗░░██╔██╗██║
  ██║░░╚██╗██╔══██║██╔══██╗██║░░██║██╔══╝░░██║╚████║
  ╚██████╔╝██║░░██║██║░░██║██████╔╝███████╗██║░╚███║
  ░╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═════╝░╚══════╝╚═╝░░╚══╝
  `;

    const title = "𝐖𝐀𝐑𝐍𝐈𝐍𝐆!";
    const firstLine = `
You opened the browser’s developer console, a tool intended only for developers. Keep your private keys and seed phrase strictly to yourself. Executing unfamiliar code in this console may compromise your account
and result in irreversible loss of access and tokens.
`;

    const support = `
To learn more about Garden, refer to our documentation: https://docs.garden.finance/ and join our community:  https://discord.gg/B7RczEFuJ5
`;

    console.log("%c" + logo, "color: #eb8daf;");
    console.log(
      "%c" + title,
      "color: #ff6e6e; font-size: 32px; font-weight: bold;"
    );
    console.log(
      "%c" + firstLine,
      "color: #fff; font-weight: bold; font-size: 12px;"
    );
    console.log(
      "%c" + support,
      "color: #eb8daf; font-weight: bold; font-size: 12px;"
    );
  }
};

export const isAlpenSignetChain = (chain: string) => {
  return chain.toLowerCase().includes("alpen_signet");
};

export const isPureBitcoin = (chain: Chain): boolean => {
  return isBitcoin(chain) && !isAlpenSignetChain(chain);
};

export const isSameChainType = (chain1: Chain, chain2: Chain): boolean => {
  if (isPureBitcoin(chain1) && isPureBitcoin(chain2)) return true;
  if (isAlpenSignetChain(chain1) && isAlpenSignetChain(chain2)) return true;
  if (isEVM(chain1) && isEVM(chain2)) return true;
  if (isStarknet(chain1) && isStarknet(chain2)) return true;
  if (isSolana(chain1) && isSolana(chain2)) return true;
  if (isSui(chain1) && isSui(chain2)) return true;
  return false;
};

export const isBitcoinSwap = (inputAsset?: Asset, outputAsset?: Asset) => {
  return !!(
    inputAsset &&
    outputAsset &&
    (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain))
  );
};

export const decideAddressVisibility = (
  inputAsset?: Asset,
  outputAsset?: Asset,
  address?: { source: string | undefined; destination: string | undefined },
  isEditAddress?: { source: boolean; destination: boolean }
) => {
  // Only show address input for Bitcoin-type assets (Bitcoin or Alpen Signet)
  // For other chains (Starknet, Solana, etc.), addresses come from wallet connection
  const isSourceBitcoinType =
    inputAsset &&
    (isBitcoin(inputAsset.chain) || isAlpenSignetChain(inputAsset.chain));

  const isDestinationBitcoinType =
    outputAsset &&
    (isBitcoin(outputAsset.chain) || isAlpenSignetChain(outputAsset.chain));

  const isSourceNeeded =
    inputAsset &&
    outputAsset &&
    isSourceBitcoinType &&
    (isAlpenSignetChain(inputAsset.chain) ||
      isEditAddress?.source ||
      !address?.source);

  const isDestinationNeeded =
    inputAsset &&
    outputAsset &&
    isDestinationBitcoinType &&
    (isAlpenSignetChain(outputAsset.chain) ||
      isEditAddress?.destination ||
      !address?.destination);

  return { isSourceNeeded, isDestinationNeeded };
};
