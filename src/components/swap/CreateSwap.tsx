import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { SwapInput } from "./SwapInput";
import { getTimeEstimates, IOType } from "../../constants/constants";
import { SwapAddress } from "./SwapAddress";
import { useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { Errors } from "../../constants/errors";
import { SwapDetails } from "./SwapDetails";
import { motion, Variants, Transition } from "framer-motion";

const detailsAnimation: Variants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: (shouldShowDetails: boolean) => ({
    opacity: shouldShowDetails ? 1 : 0,
    height: shouldShowDetails ? "auto" : 0,
    marginTop: shouldShowDetails ? "12px" : 0,
  }),
};

const addressAnimation: Variants = {
  initial: { opacity: 0, height: 0, marginBottom: 0 },
  animate: (custom: [boolean, string | undefined]) => ({
    opacity: custom[0] || !custom[1] ? 1 : 0,
    height: custom[0] || !custom[1] ? "auto" : 0,
    marginBottom: custom[0] || !custom[1] ? "12px" : 0,
  }),
};

const transition: Transition = { duration: 0.3, ease: "easeOut" };

export const CreateSwap = () => {
  const {
    outputAmount,
    inputAmount,
    inputAsset,
    outputAsset,
    handleInputAmountChange,
    handleOutputAmountChange,
    loading,
    error,
    tokenPrices,
    validSwap,
    inputTokenBalance,
    isEditBTCAddress,
    isSwapping,
    isValidBitcoinAddress,
    handleSwapClick,
    swapAssets,
  } = useSwap();
  const { account: btcAddress } = useBitcoinWallet();

  const isDisabled = isSwapping || !validSwap || !!error.swapError;

  const buttonLabel = useMemo(() => {
    return error.swapError === Errors.insufficientBalance
      ? "Insufficient balance"
      : error.swapError === Errors.insufficientLiquidity
        ? "Insufficient Liquidity"
        : isSwapping
          ? "Signing..."
          : "Swap";
  }, [error.swapError, isSwapping]);

  const buttonVariant = useMemo(() => {
    return error.swapError
      ? "disabled"
      : isSwapping
        ? "ternary"
        : validSwap
          ? "primary"
          : "disabled";
  }, [isSwapping, validSwap, error.swapError]);

  const timeEstimate = useMemo(() => {
    if (!inputAsset || !outputAsset) return "";
    return getTimeEstimates(inputAsset);
  }, [inputAsset, outputAsset]);

  const shouldShowDetails = useMemo(() => {
    return !!(
      inputAsset &&
      outputAsset &&
      !error.inputError &&
      !error.outputError &&
      !error.swapError &&
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
    <div
      className={`before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-black before:bg-opacity-0 before:transition-colors before:duration-700 before:content-['']`}
    >
      <div className="flex flex-col p-3">
        <div className="relative flex flex-col gap-3">
          <SwapInput
            type={IOType.input}
            amount={inputAmount}
            asset={inputAsset}
            onChange={handleInputAmountChange}
            loading={loading.input}
            price={tokenPrices.input}
            error={error.inputError}
            balance={inputTokenBalance}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-light-grey bg-white p-1.5 transition-transform hover:scale-[1.1]"
            onClick={swapAssets}
          >
            <ExchangeIcon />
          </div>
          <SwapInput
            type={IOType.output}
            amount={outputAmount}
            asset={outputAsset}
            onChange={handleOutputAmountChange}
            loading={loading.output}
            error={error.outputError}
            price={tokenPrices.output}
            timeEstimate={timeEstimate}
          />
        </div>
        <motion.div
          custom={shouldShowDetails}
          variants={detailsAnimation}
          initial="initial"
          animate="animate"
          transition={transition}
          className={`flex flex-col overflow-hidden ${
            shouldShowDetails ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <motion.div
            custom={[isEditBTCAddress, btcAddress]}
            variants={addressAnimation}
            initial="initial"
            animate="animate"
            transition={transition}
            className="overflow-hidden"
          >
            <SwapAddress isValidAddress={isValidBitcoinAddress} />
          </motion.div>
          <SwapDetails
            tokenPrices={tokenPrices}
            isExpanded={shouldShowDetails}
          />
        </motion.div>
        <Button
          className={`mt-3 transition-colors duration-500${
            isSwapping ? "cursor-not-allowed" : ""
          }`}
          variant={buttonVariant}
          size="lg"
          onClick={handleSwapClick}
          disabled={isDisabled}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
