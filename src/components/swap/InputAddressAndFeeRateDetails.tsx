import { AnimatePresence, motion } from "framer-motion";
import { FeesAndRateDetails } from "./FeesAndRateDetails";
import { InputAddress } from "./InputAddress";
import { useMemo } from "react";
import { swapStore } from "../../store/swapStore";
import { detailsExpandAnimation } from "../../animations/animations";
import { AddressType } from "../../constants/constants";
import { decideAddressVisibility, isAlpenSignetChain } from "../../utils/utils";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Chains, isEVM } from "@gardenfi/orderbook";

export const InputAddressAndFeeRateDetails = () => {
  const {
    inputAsset,
    outputAsset,
    error,
    inputAmount,
    outputAmount,
    isEditAddress,
    sourceAddress: walletSource,
    destinationAddress: walletDestination,
  } = swapStore();
  const { account } = useBitcoinWallet();
  const { account: ltcAccount } = useLitecoinWallet();
  const { address: walletEvmAddress } = useEVMWallet();

  // For decideAddressVisibility, use wallet addresses only (source of truth)
  const walletAddress = useMemo(
    () => ({
      source: walletSource,
      destination: walletDestination,
    }),
    [walletSource, walletDestination]
  );

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
      decideAddressVisibility(
        inputAsset,
        outputAsset,
        walletAddress,
        isEditAddress
      ),
    [inputAsset, outputAsset, walletAddress, isEditAddress]
  );

  // Check if addresses are shown in bottom section (from wallet)
  // Bitcoin (not Alpen) and EVM addresses show in bottom from wallet
  const hasRefundAddressInBottom = useMemo(() => {
    const isBitcoinChain =
      inputAsset &&
      (inputAsset.chain === Chains.bitcoin ||
        inputAsset.chain === Chains.bitcoin_testnet) &&
      !isAlpenSignetChain(inputAsset.chain);
    const isLitecoinChain =
      inputAsset &&
      inputAsset.chain === Chains.litecoin_testnet &&
      !isAlpenSignetChain(inputAsset.chain);
    const isEvmChain = inputAsset && isEVM(inputAsset.chain);

    return !!(
      inputAsset &&
      !isEditAddress.source &&
      walletSource &&
      ((isBitcoinChain && account) ||
        (isEvmChain && walletEvmAddress) ||
        (isLitecoinChain && ltcAccount))
    );
  }, [
    inputAsset,
    isEditAddress.source,
    walletSource,
    account,
    walletEvmAddress,
    ltcAccount,
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
      walletDestination &&
      ((isBitcoinChain && account) || (isEvmChain && walletEvmAddress))
    );
  }, [
    account,
    walletEvmAddress,
    outputAsset,
    isEditAddress.destination,
    walletDestination,
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
          {shouldShowRefundInput && (
            <InputAddress addressType={AddressType.REFUND} />
          )}
          {shouldShowReceiveInput && (
            <InputAddress addressType={AddressType.RECEIVE} />
          )}
          <FeesAndRateDetails />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
