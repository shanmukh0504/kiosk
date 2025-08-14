import { useEffect } from "react";
import { constructOrderPair } from "@gardenfi/core";
import {
  calculateBitcoinNetworkFees,
  getSuiNetworkFee,
} from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { isBitcoin, isSui } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";
import { swapStore } from "../store/swapStore";
import { getBitcoinNetwork, SUI_SOLVER_ADDRESS } from "../constants/constants";
import logger from "../utils/logger";

export const useNetworkFees = () => {
  const { strategies, fiatData } = assetInfoStore();
  const {
    setNetworkFees,
    setIsNetworkFeesLoading,
    inputAsset,
    outputAsset,
    inputAmount,
  } = swapStore();

  const bitcoin_network = getBitcoinNetwork();

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

        const hasBitcoinInput = isBitcoin(inputAsset.chain);
        const hasBitcoinOutput = isBitcoin(outputAsset.chain);
        const hasSuiInput = isSui(inputAsset.chain);

        let totalFees = strategy.fixed_fee;

        if (hasBitcoinInput || hasBitcoinOutput) {
          const bitcoinFees = await calculateBitcoinNetworkFees(
            bitcoin_network,
            hasBitcoinInput ? inputAsset : outputAsset
          );
          totalFees += bitcoinFees;
        }

        if (hasSuiInput) {
          const suiFees = await getSuiNetworkFee(
            SUI_SOLVER_ADDRESS,
            inputAsset,
            inputAmount,
            fiatData
          );
          totalFees += suiFees;
        }
        setNetworkFees(formatAmount(totalFees, 0));
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
  }, [
    bitcoin_network,
    inputAsset,
    outputAsset,
    strategies.val,
    inputAmount,
    fiatData,
  ]);
};
