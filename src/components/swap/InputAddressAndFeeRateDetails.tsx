import { AnimatePresence, motion } from "framer-motion";
import { FeesAndRateDetails } from "./FeesAndRateDetails";
import { InputAddress } from "./InputAddress";
import { swapStore } from "../../store/swapStore";
import { detailsExpandAnimation } from "../../animations/animations";
import { Errors } from "../../constants/errors";
import { useMemo } from "react";

type InputAddressAndFeeRateDetailsProps = {
  isValidBitcoinAddress: boolean;
};

export const InputAddressAndFeeRateDetails = ({
  isValidBitcoinAddress,
}: InputAddressAndFeeRateDetailsProps) => {
  const { inputAsset, outputAsset, error, inputAmount, outputAmount } =
    swapStore();

  const shouldShowDetails = useMemo(() => {
    return !!(
      inputAsset &&
      outputAsset &&
      !error.inputError &&
      !error.outputError &&
      error.swapError !== Errors.insufficientLiquidity &&
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
    error.swapError,
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
          className={`flex flex-col overflow-hidden ${
            shouldShowDetails ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <InputAddress isValidAddress={isValidBitcoinAddress} />
          <FeesAndRateDetails />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
