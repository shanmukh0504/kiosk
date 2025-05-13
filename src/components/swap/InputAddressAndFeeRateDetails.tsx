import { motion } from "framer-motion";
import { FeesAndRateDetails } from "./FeesAndRateDetails";
import { InputAddress } from "./InputAddress";
import { swapStore } from "../../store/swapStore";
import {
  addressExpandAnimation,
  detailsExpandAnimation,
} from "../../animations/animations";
import { Errors } from "../../constants/errors";
import { useMemo } from "react";
import { isBitcoin } from "@gardenfi/orderbook";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";

type InputAddressAndFeeRateDetailsProps = {
  isValidBitcoinAddress: boolean;
};

export const InputAddressAndFeeRateDetails = ({
  isValidBitcoinAddress,
}: InputAddressAndFeeRateDetailsProps) => {
  const {
    inputAsset,
    outputAsset,
    error,
    inputAmount,
    outputAmount,
    isEditBTCAddress,
  } = swapStore();
  const { account: btcAddress } = useBitcoinWallet();

  const shouldShowAddress = useMemo(() => {
    return (
      (isEditBTCAddress || !btcAddress) &&
      ((inputAsset?.chain && isBitcoin(inputAsset.chain)) ||
        (outputAsset?.chain && isBitcoin(outputAsset.chain)))
    );
  }, [isEditBTCAddress, btcAddress, inputAsset, outputAsset]);

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
    <motion.div
      variants={detailsExpandAnimation}
      initial="hidden"
      animate={shouldShowDetails ? "visible" : "hidden"}
      className={`flex flex-col overflow-hidden ${
        shouldShowDetails ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {shouldShowAddress && (
        <motion.div
          variants={addressExpandAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <InputAddress isValidAddress={isValidBitcoinAddress} />
        </motion.div>
      )}
      <FeesAndRateDetails />
    </motion.div>
  );
};
