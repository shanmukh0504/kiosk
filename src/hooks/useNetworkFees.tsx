import { useEffect, useState } from "react";
import { BitcoinNetwork } from "@catalogfi/wallets";
import { calculateNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { Asset } from "@gardenfi/orderbook";

export const useNetworkFees = (
  network: BitcoinNetwork,
  outputAsset?: Asset
) => {
  const [networkFeesValue, setNetworkFeesValue] = useState<string>("Free");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let intervalId: number | null = null;
    const fetchNetworkFees = async () => {
      setIsLoading(true);
      try {
        const fees = await calculateNetworkFees(network, outputAsset);
        setNetworkFeesValue(`$${formatAmount(fees, 0, 2)}`);
      } catch (error) {
        console.error(error);
        setNetworkFeesValue("Free");
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
