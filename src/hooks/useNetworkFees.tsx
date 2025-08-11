import { useEffect } from "react";
import { constructOrderPair } from "@gardenfi/core";
import { calculateBitcoinNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { isBitcoin } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";
import { swapStore } from "../store/swapStore";
import { getBitcoinNetwork } from "../constants/constants";
import logger from "../utils/logger";

export const useNetworkFees = () => {
  const { strategies } = assetInfoStore();
  const { setNetworkFees, setIsNetworkFeesLoading, inputAsset, outputAsset } =
    swapStore();

  const network = getBitcoinNetwork();

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
          setNetworkFees(formatAmount(fees + strategy.fixed_fee, 0));
        } else {
          setNetworkFees(formatAmount(strategy.fixed_fee, 0));
        }
      } catch (error) {
        logger.error("failed to fetch network fees ❌", error);
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
