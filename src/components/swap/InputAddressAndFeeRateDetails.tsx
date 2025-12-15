import { AnimatePresence, motion } from "framer-motion";
import { FeesAndRateDetails } from "./FeesAndRateDetails";
import { InputAddress } from "./InputAddress";
import { useMemo } from "react";
import { swapStore } from "../../store/swapStore";
import { detailsExpandAnimation } from "../../animations/animations";
import { AddressType } from "../../constants/constants";
import { decideAddressVisibility, isAlpenSignetChain } from "../../utils/utils";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Chains, isEVM } from "@gardenfi/orderbook";
import { walletAddressStore } from "../../store/walletAddressStore";

export const InputAddressAndFeeRateDetails = () => {
  const {
    inputAsset,
    outputAsset,
    error,
    inputAmount,
    outputAmount,
    isEditAddress,
  } = swapStore();
  const { address } = walletAddressStore();
  const { account } = useBitcoinWallet();
  const { address: walletEvmAddress } = useEVMWallet();

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

  const { isSourceNeeded, isDestinationNeeded } = useMemo(
    () =>
      decideAddressVisibility(inputAsset, outputAsset, address, isEditAddress),
    [inputAsset, outputAsset, address, isEditAddress]
  );

  // Check if addresses are shown in bottom section (from wallet)
  // Bitcoin (not Alpen) and EVM addresses show in bottom from wallet
  const hasRefundAddressInBottom = useMemo(() => {
    const isBitcoinChain =
      inputAsset &&
      (inputAsset.chain === Chains.bitcoin ||
        inputAsset.chain === Chains.bitcoin_testnet) &&
      !isAlpenSignetChain(inputAsset.chain);
    const isEvmChain = inputAsset && isEVM(inputAsset.chain);

    return !!(
      inputAsset &&
      !isEditAddress.source &&
      address.source &&
      ((isBitcoinChain && account) || (isEvmChain && walletEvmAddress))
    );
  }, [
    account,
    walletEvmAddress,
    inputAsset,
    isEditAddress.source,
    address.source,
  ]);

  const hasReceiveAddressInBottom = useMemo(() => {
    const isBitcoinChain =
      outputAsset &&
      (outputAsset.chain === Chains.bitcoin ||
        outputAsset.chain === Chains.bitcoin_testnet) &&
      !isAlpenSignetChain(outputAsset.chain);
    const isEvmChain = outputAsset && isEVM(outputAsset.chain);

    return !!(
      outputAsset &&
      !isEditAddress.destination &&
      address.destination &&
      ((isBitcoinChain && account) || (isEvmChain && walletEvmAddress))
    );
  }, [
    account,
    walletEvmAddress,
    outputAsset,
    isEditAddress.destination,
    address.destination,
  ]);

  // Simple logic: Show input if needed AND not already in bottom
  const shouldShowReceiveInput = useMemo(() => {
    const result = isDestinationNeeded && !hasReceiveAddressInBottom;
    return result;
  }, [isDestinationNeeded, hasReceiveAddressInBottom]);

  const shouldShowRefundInput = useMemo(() => {
    const result = isSourceNeeded && !hasRefundAddressInBottom;
    return result;
  }, [isSourceNeeded, hasRefundAddressInBottom]);

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
          {shouldShowReceiveInput && (
            <InputAddress addressType={AddressType.RECEIVE} />
          )}
          {shouldShowRefundInput && (
            <InputAddress addressType={AddressType.REFUND} />
          )}
          <FeesAndRateDetails />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
