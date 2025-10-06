import { useEffect } from "react";
import {
  calculateBitcoinNetworkFees,
  getSuiNetworkFee,
} from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { isBitcoin, isSui } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";
import { swapStore } from "../store/swapStore";
import {
  BITCOIN_DEFAULT_NETWORK_FEE,
  network,
  SUI_DEFAULT_NETWORK_FEE,
  SUI_SOLVER_ADDRESS,
} from "../constants/constants";
import logger from "../utils/logger";

const DEFAULT_BASE_FEE = 0; //TODO: get from API

export const useNetworkFees = () => {
  const { fiatData } = assetInfoStore();
  const {
    setNetworkFees,
    setIsNetworkFeesLoading,
    inputAsset,
    outputAsset,
    inputAmount,
  } = swapStore();

  useEffect(() => {
    if (!inputAsset || !outputAsset) return;

    const fetchNetworkFees = async () => {
      setIsNetworkFeesLoading(true);
      try {
        const hasBitcoinInput = isBitcoin(inputAsset.chain);
        const hasBitcoinOutput = isBitcoin(outputAsset.chain);
        const hasSuiInput = isSui(inputAsset.chain);

        // Start with base fee (network/protocol fee)
        let totalFees = DEFAULT_BASE_FEE;

        const feeCalculations = [];

        // Calculate Bitcoin network fees if Bitcoin is involved
        if (hasBitcoinInput || hasBitcoinOutput) {
          feeCalculations.push(
            calculateBitcoinNetworkFees(
              network,
              hasBitcoinInput ? inputAsset : outputAsset
            ).catch((err) => {
              logger.error(
                "Bitcoin fee calculation failed, using default",
                err
              );
              return BITCOIN_DEFAULT_NETWORK_FEE;
            })
          );
        } else {
          feeCalculations.push(Promise.resolve(0));
        }

        if (hasSuiInput) {
          feeCalculations.push(
            getSuiNetworkFee(
              SUI_SOLVER_ADDRESS,
              inputAsset,
              inputAmount,
              fiatData
            ).catch((err) => {
              logger.error("Sui fee calculation failed, using default", err);
              return SUI_DEFAULT_NETWORK_FEE;
            })
          );
        } else {
          feeCalculations.push(Promise.resolve(0));
        }

        const [bitcoinFees, suiFees] = await Promise.all(feeCalculations);
        totalFees += bitcoinFees + suiFees;
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
    network,
    inputAsset,
    outputAsset,
    inputAmount,
    fiatData,
    setNetworkFees,
    setIsNetworkFeesLoading,
  ]);
};
