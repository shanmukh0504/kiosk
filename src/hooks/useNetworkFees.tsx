import { useEffect, useState } from "react";
import { BitcoinNetwork } from "@gardenfi/core";
import { calculateNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { Asset } from "@gardenfi/orderbook";

export const useNetworkFees = (
  network: BitcoinNetwork,
  outputAsset?: Asset
) => {
  const [networkFeesValue, setNetworkFeesValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let intervalId: number | null = null;
    const fetchNetworkFees = async () => {
      setIsLoading(true);
      try {
        const fees = await calculateNetworkFees(network, outputAsset);
        setNetworkFeesValue(formatAmount(fees, 0, 2));
      } catch (error) {
        console.error(error);
        setNetworkFeesValue(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworkFees();

    intervalId = window.setInterval(fetchNetworkFees, 15000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [network, outputAsset]);
  return {
    networkFeesValue,
    isLoading,
  };
};
