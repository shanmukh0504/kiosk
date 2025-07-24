import { useEffect } from "react";
import { BitcoinNetwork, constructOrderPair } from "@gardenfi/core";
import { calculateBitcoinNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";
import { swapStore } from "../store/swapStore";

export const useNetworkFees = (
  network: BitcoinNetwork,
  inputAsset?: Asset,
  outputAsset?: Asset
) => {
  const { strategies } = assetInfoStore();
  const { setNetworkFees, setIsNetworkFeesLoading } = swapStore();

  useEffect(() => {
    if (!inputAsset || !outputAsset || !strategies.val) return;

    const fetchNetworkFees = async () => {
      if (!strategies.val) return;

      setIsNetworkFeesLoading(true);
      try {
        const strategy =
          strategies.val[
            constructOrderPair(
              inputAsset.chain,
              inputAsset.atomicSwapAddress,
              outputAsset.chain,
              outputAsset.atomicSwapAddress
            )
          ];
        if (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain)) {
          const fees = await calculateBitcoinNetworkFees(
            network,
            isBitcoin(inputAsset.chain) ? inputAsset : outputAsset
          );
          console.log("1", formatAmount(fees + strategy.fixed_fee, 0));
          setNetworkFees(formatAmount(fees + strategy.fixed_fee, 0));
        } else {
          console.log("2", formatAmount(strategy.fixed_fee, 0));
          setNetworkFees(formatAmount(strategy.fixed_fee, 0));
        }
      } catch (error) {
        console.error(error);
        setNetworkFees(0);
      } finally {
        setIsNetworkFeesLoading(false);
      }
    };
    fetchNetworkFees();

    const intervalId = setInterval(fetchNetworkFees, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [network, inputAsset, outputAsset, strategies.val]);
};
