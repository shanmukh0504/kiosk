import { AnimatePresence, motion } from "framer-motion";
import { FeesAndRateDetails } from "./FeesAndRateDetails";
import { InputAddress } from "./InputAddress";
import { useMemo } from "react";
import { swapStore } from "../../store/swapStore";
import { detailsExpandAnimation } from "../../animations/animations";

export const InputAddressAndFeeRateDetails = () => {
  const { inputAsset, outputAsset, error, inputAmount, outputAmount } =
    swapStore();

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
      {shouldShowDetails && (
        <motion.div
          variants={detailsExpandAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col overflow-hidden"
        >
          <InputAddress />
          <FeesAndRateDetails />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
