import { useEffect, useState } from "react";
import { BitcoinNetwork } from "@catalogfi/wallets";
import { calculateNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";

export const useNetworkFees = (
  network: BitcoinNetwork,
  isBitcoinOutput: boolean
) => {
  const [networkFeesValue, setNetworkFeesValue] = useState<string>("Free");

  useEffect(() => {
    let intervalId: number | null = null;
    const fetchNetworkFees = async () => {
      if (isBitcoinOutput) {
        const fees = await calculateNetworkFees(network);
        setNetworkFeesValue(`$${formatAmount(fees, 0, 2)}`);
      } else {
        setNetworkFeesValue("Free");
      }
    };
    fetchNetworkFees();
    if (isBitcoinOutput) {
      intervalId = window.setInterval(fetchNetworkFees, 5000);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [network, isBitcoinOutput]);

  return networkFeesValue;
};
