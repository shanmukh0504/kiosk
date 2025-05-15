import { AnimatePresence, motion } from "framer-motion";
import { FeesAndRateDetails } from "./FeesAndRateDetails";
import { InputAddress } from "./InputAddress";
import { useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";

export const InputAddressAndFeeRateDetails = () => {
  const { inputAsset, outputAsset, error, inputAmount, outputAmount } =
    useSwap();

  const shouldShowDetails = useMemo(() => {
    return !!(
      inputAsset &&
      outputAsset &&
      !error.inputError &&
      !error.outputError &&
      !error.liquidityError &&
      inputAmount &&
      outputAmount &&
      Number(inputAmount) !== 0 &&
      Number(outputAmount) !== 0
    );
  }, [
    inputAsset,
    outputAsset,
    error.inputError,
    error.outputError,
    error.liquidityError,
    inputAmount,
    outputAmount,
  ]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          height: 0,
          marginTop: 0,
        }}
        animate={{
          opacity: shouldShowDetails ? 1 : 0,
          height: shouldShowDetails ? "auto" : 0,
          marginTop: shouldShowDetails ? "12px" : 0,
          pointerEvents: shouldShowDetails ? "auto" : "none",
        }}
        exit={{
          opacity: 0,
          height: 0,
          marginTop: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          opacity: { duration: 0.2 },
          height: { duration: 0.3 },
          marginTop: { duration: 0.3 },
        }}
        className="flex flex-col overflow-hidden"
      >
        <InputAddress />
        <FeesAndRateDetails />
      </motion.div>
    </AnimatePresence>
  );
};
