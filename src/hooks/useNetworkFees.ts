import { useEffect, useState } from "react";
import { BitcoinNetwork } from "@catalogfi/wallets";
import { calculateNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";

export const useNetworkFees = (network: BitcoinNetwork) => {
  const [networkFeesValue, setNetworkFeesValue] = useState<string>("Free");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let intervalId: number | null = null;
    const fetchNetworkFees = async () => {
      setIsLoading(true);
      try {
        const fees = await calculateNetworkFees(network);
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
  }, [network]);
  return {
    networkFeesValue,
    isLoading,
  };
};
