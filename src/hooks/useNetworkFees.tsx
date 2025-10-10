import { useEffect, useRef, useCallback } from "react";
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

export const useNetworkFees = () => {
  const { fiatData } = assetInfoStore();
  const {
    setNetworkFees,
    setIsNetworkFeesLoading,
    inputAsset,
    outputAsset,
    inputAmount,
    fixedFee,
  } = swapStore();

  const latestRef = useRef({ inputAsset, outputAsset, inputAmount, fiatData });

  useEffect(() => {
    latestRef.current = { inputAsset, outputAsset, inputAmount, fiatData };
  }, [inputAsset, outputAsset, inputAmount, fiatData]);

  const hasLoadedOnceRef = useRef(false);
  const fetchNetworkFees = useCallback(async () => {
    const { inputAsset, outputAsset, inputAmount, fiatData } =
      latestRef.current;
    if (!inputAsset || !outputAsset) return;

    if (!hasLoadedOnceRef.current) setIsNetworkFeesLoading(true);
    try {
      const hasBitcoinInput = isBitcoin(inputAsset.chain);
      const hasBitcoinOutput = isBitcoin(outputAsset.chain);
      const hasSuiInput = isSui(inputAsset.chain);

      let totalFees = fixedFee;
      const feeCalculations: Array<Promise<number>> = [];

      if (hasBitcoinInput || hasBitcoinOutput) {
        feeCalculations.push(
          calculateBitcoinNetworkFees(
            network,
            hasBitcoinInput ? inputAsset : outputAsset
          ).catch((err) => {
            logger.error("Bitcoin fee calculation failed, using default", err);
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
      if (!hasLoadedOnceRef.current) {
        setIsNetworkFeesLoading(false);
        hasLoadedOnceRef.current = true;
      }
    }
  }, [setNetworkFees, setIsNetworkFeesLoading, fixedFee]);

  // Debounce re-calculation when amount changes (avoid per-keystroke RPC calls)
  useEffect(() => {
    const handle = setTimeout(fetchNetworkFees, 500);
    return () => clearTimeout(handle);
  }, [inputAmount, fetchNetworkFees]);

  // Poll periodically (independent of typing)
  useEffect(() => {
    if (!inputAsset || !outputAsset) return;
    fetchNetworkFees();
    const intervalId = setInterval(fetchNetworkFees, 15000);
    return () => clearInterval(intervalId);
  }, [inputAsset, outputAsset, fiatData, fixedFee, fetchNetworkFees]);
};
