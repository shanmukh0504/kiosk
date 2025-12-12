import { useId, useRef, ChangeEvent, useMemo, FC, useEffect } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Tooltip } from "../../common/Tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { addressExpandAnimation } from "../../animations/animations";
import { swapStore } from "../../store/swapStore";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { AddressType } from "../../constants/constants";
import { validateAddress } from "../../utils/addressValidation";
import { isBitcoin, isEVM } from "@gardenfi/orderbook";
import { useWallet } from "../../hooks/useWallet";

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
  } = swapStore();
  const { address, setAddress } = useWallet();

  const { account: walletBtcAddress } = useBitcoinWallet();
  const { address: walletEvmAddress } = useEVMWallet();

  const isEditing = isRefund ? isEditAddress.source : isEditAddress.destination;

  useEffect(() => {
    if (isEditing) {
      const isBitcoinInInput = inputAsset && isBitcoin(inputAsset.chain);
      const isBitcoinInOutput = outputAsset && isBitcoin(outputAsset.chain);
      const isEvmInInput = inputAsset && isEVM(inputAsset.chain);
      const isEvmInOutput = outputAsset && isEVM(outputAsset.chain);

      if (isRefund) {
        if (isBitcoinInInput && walletBtcAddress && !address.source) {
          setAddress({ source: walletBtcAddress });
        } else if (isEvmInInput && walletEvmAddress && !address.source) {
          setAddress({ source: walletEvmAddress });
        }
      } else {
        if (isBitcoinInOutput && walletBtcAddress && !address.destination) {
          setAddress({ destination: walletBtcAddress });
        } else if (isEvmInOutput && walletEvmAddress && !address.destination) {
          setAddress({ destination: walletEvmAddress });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditing,
    walletBtcAddress,
    walletEvmAddress,
    inputAsset,
    outputAsset,
    isRefund,
  ]);

  const displayAddress = isRefund ? address.source : address.destination;
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

    if (isRefund) {
      setAddress({ source: input });
    } else {
      setAddress({ destination: input });
    }
  };

  // Update validAddress state in an effect
  useEffect(() => {
    const sourceChain = inputAsset?.chain;
    const destinationChain = outputAsset?.chain;

    const sourceValid = validateAddress(address.source, sourceChain);
    const destinationValid = validateAddress(
      address.destination,
      destinationChain
    );

    setValidAddress({
      source: sourceValid,
      destination: destinationValid,
    });
  }, [
    inputAsset,
    outputAsset,
    setValidAddress,
    address.source,
    address.destination,
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
