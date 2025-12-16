import { useId, useRef, ChangeEvent, useMemo, FC, useEffect } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Tooltip } from "../../common/Tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { addressExpandAnimation } from "../../animations/animations";
import { swapStore } from "../../store/swapStore";
import { AddressType } from "../../constants/constants";
import { validateAddress } from "../../utils/addressValidation";
import { walletAddressStore } from "../../store/walletAddressStore";
import { userProvidedAddressStore } from "../../store/userProvidedAddressStore";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { isPureBitcoin } from "../../utils/utils";

type InputAddressProps = {
  addressType: AddressType | undefined;
};

export const InputAddress: FC<InputAddressProps> = ({ addressType }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const isRefund = useMemo(() => {
    return addressType === AddressType.REFUND;
  }, [addressType]);

  const tooltipId = useId();
  const {
    inputAsset,
    isEditAddress,
    outputAsset,
    validAddress,
    setValidAddress,
    setIsEditAddress,
  } = swapStore();
  const { source: walletSource, destination: walletDestination } =
    walletAddressStore();
  const {
    source: userSource,
    destination: userDestination,
    setSource: setUserSource,
    setDestination: setUserDestination,
  } = userProvidedAddressStore();
  const { account: btcAccount } = useBitcoinWallet();

  const isEditing = isRefund ? isEditAddress.source : isEditAddress.destination;

  const relevantAsset = isRefund ? inputAsset : outputAsset;
  const relevantChain = relevantAsset?.chain;
  const isBitcoinAsset = relevantChain ? isPureBitcoin(relevantChain) : false;
  const isWalletConnected = isBitcoinAsset ? !!btcAccount : false;

  // Track previous editing state to detect when edit mode is first activated
  const prevIsEditingRef = useRef(isEditing);

  // When edit mode is activated (transitions from false to true), populate userProvidedAddress
  // ONLY for Bitcoin assets when wallet is connected
  // Only runs once when isEditing becomes true, not on subsequent changes
  useEffect(() => {
    const justEnteredEditMode = !prevIsEditingRef.current && isEditing;

    if (justEnteredEditMode && isBitcoinAsset && isWalletConnected) {
      if (isRefund) {
        if (walletSource && !userSource) {
          setUserSource(walletSource);
        }
      } else {
        if (walletDestination && !userDestination) {
          setUserDestination(walletDestination);
        }
      }
    }

    // Update the previous editing state
    prevIsEditingRef.current = isEditing;
  }, [
    isEditing,
    isRefund,
    isBitcoinAsset,
    isWalletConnected,
    walletSource,
    walletDestination,
    userSource,
    userDestination,
    setUserSource,
    setUserDestination,
  ]);

  // Display address: use userProvidedAddress when editing, otherwise use walletAddress
  const displayAddress = isRefund
    ? isEditing
      ? userSource || ""
      : walletSource || ""
    : isEditing
      ? userDestination || ""
      : walletDestination || "";
  const currentValidAddress = isRefund
    ? validAddress.source
    : validAddress.destination;

  const shouldShowAddress = () => {
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1) || "")) {
      input = input.slice(0, -1);
    }

    // Ensure edit mode is enabled when user types
    if (isRefund && !isEditAddress.source) {
      setIsEditAddress({
        source: true,
        destination: isEditAddress.destination,
      });
    } else if (!isRefund && !isEditAddress.destination) {
      setIsEditAddress({
        source: isEditAddress.source,
        destination: true,
      });
    }

    // Update userProvidedAddressStore when user types
    if (isRefund) {
      setUserSource(input || undefined);
    } else {
      setUserDestination(input || undefined);
    }
  };

  // Update validAddress state in an effect
  // Use userProvidedAddress if available, otherwise use walletAddress
  useEffect(() => {
    const sourceChain = inputAsset?.chain;
    const destinationChain = outputAsset?.chain;

    const sourceAddress = userSource || walletSource;
    const destinationAddress = userDestination || walletDestination;

    const sourceValid = validateAddress(sourceAddress, sourceChain);
    const destinationValid = validateAddress(
      destinationAddress,
      destinationChain
    );

    setValidAddress({
      source: sourceValid,
      destination: destinationValid,
    });
  }, [
    inputAsset,
    outputAsset,
    userSource,
    userDestination,
    walletSource,
    walletDestination,
    setValidAddress,
  ]);

  return (
    <AnimatePresence mode="wait">
      {shouldShowAddress() && (
        <motion.div
          variants={addressExpandAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
            <Typography
              data-tooltip-id={isRefund ? tooltipId : ""}
              size="h5"
              weight="medium"
              onClick={() => inputRef.current?.focus()}
              className="w-fit"
            >
              {isRefund ? "Refund" : "Receive"} address
            </Typography>
            <Typography size="h3" weight="regular">
              <input
                ref={inputRef}
                className={`w-full outline-none placeholder:text-mid-grey ${
                  !currentValidAddress ? "text-error-red" : ""
                }`}
                type="text"
                value={displayAddress}
                placeholder="Your Bitcoin address"
                onChange={handleChange}
              />
              {isRefund && (
                <Tooltip
                  id={tooltipId}
                  place="right"
                  content="In case your swap expires, your Bitcoin will be automatically refunded to this address."
                  multiline={true}
                />
              )}
            </Typography>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
