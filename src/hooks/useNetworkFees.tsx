import { useEffect, useState } from "react";
import { BitcoinNetwork, constructOrderPair } from "@gardenfi/core";
import { calculateBitcoinNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";

export const useNetworkFees = (
  network: BitcoinNetwork,
  inputAsset?: Asset,
  outputAsset?: Asset
) => {
  const [networkFeesValue, setNetworkFeesValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const { strategies } = assetInfoStore();

  useEffect(() => {
    if (!inputAsset || !outputAsset || !strategies.val) return;

    const fetchNetworkFees = async () => {
      setIsLoading(true);
      try {
        if (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain)) {
          const fees = await calculateBitcoinNetworkFees(
            network,
            isBitcoin(inputAsset.chain) ? inputAsset : outputAsset
          );
          setNetworkFeesValue(formatAmount(fees, 0, 2));
        } else if (strategies.val) {
          const strategy =
            strategies.val[
              constructOrderPair(
                inputAsset.chain,
                inputAsset.atomicSwapAddress,
                outputAsset.chain,
                outputAsset.atomicSwapAddress
              )
            ];
          if (strategy)
            setNetworkFeesValue(formatAmount(strategy.fixed_fee, 0));
        }
      } catch (error) {
        console.error(error);
        setNetworkFeesValue(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworkFees();

    const intervalId = setInterval(fetchNetworkFees, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [network, inputAsset, outputAsset, strategies.val]);

  return {
    networkFeesValue,
    isLoading,
  };
};
