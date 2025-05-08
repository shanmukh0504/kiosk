import { Asset } from "@gardenfi/orderbook";
import { ASSET_MAPPINGS, AssetMappingType } from "./constants";

export const formatTime = (totalSeconds: number | string): string => {
  const sec = Number(totalSeconds);
  if (isNaN(sec)) return "-";

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = (sec % 60).toFixed(0);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
};

export const parseTime = (time: string | undefined) => {
  if (!time) return 0;
  const cleanedTime = time.replace("~", "").trim();
  const match = cleanedTime.match(/(?:(\d+)m)?\s*(?:(\d+)s)?/);

  if (!match) return 0;
  const minutes = match[1] ? parseInt(match[1]) : 0;
  const seconds = match[2] ? parseInt(match[2]) : 0;

  return minutes * 60 + seconds;
};

export const formatTimeDiff = (time: number, gardenSwapTime: string) => {
  const diff = time - parseTime(gardenSwapTime);
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}${formatTime(Math.abs(diff))}`;
};

export const getFormattedAsset = (asset: Asset, type: AssetMappingType) =>
  ASSET_MAPPINGS[type]?.[`${asset.chain}:${asset.symbol}`];
