import { ThorSwapAsset, ThorSwapResponse, ThorSwapRoute } from "./constants";
import { Asset } from "@gardenfi/orderbook";
import { comparisonMetric } from "./constants";
import { API_URLS, SwapPlatform } from "./constants";
import { getFormattedAsset } from "./utils";
import axios from "axios";
import BigNumber from "bignumber.js";

export const getThorFee = async (
  srcAsset: Asset,
  destAsset: Asset,
  amount: number
): Promise<comparisonMetric> => {
  const sellFormat = getFormattedAsset(srcAsset, SwapPlatform.THORSWAP);
  const buyFormat = getFormattedAsset(destAsset, SwapPlatform.THORSWAP);

  if (!sellFormat || !buyFormat) {
    return { fee: 0, time: 0 };
  }

  try {
    const { data: result } = await axios.post<ThorSwapResponse>(
      API_URLS.thorSwap,
      {
        sellAsset: sellFormat,
        buyAsset: buyFormat,
        sellAmount: amount.toString(),
        sourceAddress: "",
        destinationAddress: "",
        affiliate: "t",
        affiliateFee: 50,
        slippage: 3,
        includeTx: true,
        cfBoost: false,
        provider: "THORCHAIN",
      },
      {
        timeout: 10000,
        headers: {
          "X-Api-Key": "3a86e7e1-54fd-4766-8cf5-d16ae00dde1b",
          "X-Version": "2",
          "Content-Type": "application/json",
        },
      }
    );

    const bestProvider = result.routes.reduce(
      (best: ThorSwapRoute, current: ThorSwapRoute) => {
        const bestAmount = parseFloat(best.expectedBuyAmount);
        const currentAmount = parseFloat(current.expectedBuyAmount);
        return currentAmount > bestAmount ? current : best;
      },
      result.routes[0]
    );

    const inputAssetsFormatted = getFormattedAsset(
      srcAsset,
      SwapPlatform.THORSWAP
    );
    const outputAssetsFormatted = getFormattedAsset(
      destAsset,
      SwapPlatform.THORSWAP
    );

    const inputTokenMeta = bestProvider.meta.assets.find(
      (asset: ThorSwapAsset) =>
        typeof asset.asset === "string" &&
        typeof inputAssetsFormatted === "string" &&
        asset.asset.toLowerCase() === inputAssetsFormatted.toLowerCase()
    );

    const outputTokenMeta = bestProvider.meta.assets.find(
      (asset: ThorSwapAsset) =>
        typeof asset.asset === "string" &&
        typeof outputAssetsFormatted === "string" &&
        asset.asset.toLowerCase() === outputAssetsFormatted.toLowerCase()
    );

    const inputValue = new BigNumber(amount)
      .multipliedBy(inputTokenMeta?.price ?? 0)
      .toNumber();

    const outputValue = new BigNumber(bestProvider.expectedBuyAmount)
      .multipliedBy(outputTokenMeta?.price ?? 0)
      .toNumber();

    const fee = inputValue - outputValue;
    const swapDuration = bestProvider.estimatedTime.total;

    return {
      fee,
      time: swapDuration,
    };
  } catch {
    return { fee: 0, time: 0 };
  }
};
