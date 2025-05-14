import { useId, useRef, ChangeEvent, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Tooltip } from "../../common/Tooltip";
import { swapStore } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion } from "framer-motion";
import { addressExpandAnimation } from "../../animations/animations";
import { useSwap } from "../../hooks/useSwap";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";

export const InputAddress = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isValidBitcoinAddress } = useSwap();

  const tooltipId = useId();
  const {
    inputAsset,
    isEditBTCAddress,
    outputAsset,
    setBtcAddress,
    btcAddress: storedBtcAddress,
  } = swapStore();

  const { account: walletBtcAddress } = useBitcoinWallet();

  const isRecoveryAddress = useMemo(
    () => !!(inputAsset && isBitcoin(inputAsset.chain)),
    [inputAsset]
  );

  const shouldShowAddress = useMemo(() => {
    return (
      (isEditBTCAddress || !walletBtcAddress) &&
      ((inputAsset?.chain && isBitcoin(inputAsset.chain)) ||
        (outputAsset?.chain && isBitcoin(outputAsset.chain)))
    );
  }, [isEditBTCAddress, walletBtcAddress, inputAsset, outputAsset]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1)!)) {
      input = input.slice(0, -1);
    }
    setBtcAddress(input);
  };

  // Use stored address if available, otherwise use wallet address
  const displayAddress = storedBtcAddress || walletBtcAddress || "";

  return (
    shouldShowAddress && (
      <motion.div
        variants={addressExpandAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
          <Typography
            data-tooltip-id={isRecoveryAddress ? tooltipId : ""}
            size="h5"
            weight="bold"
            onClick={() => inputRef.current!.focus()}
            className="w-fit"
          >
            {isRecoveryAddress ? "Refund" : "Receive"} address
          </Typography>
          <Typography size="h3" weight="medium">
            <input
              ref={inputRef}
              className={`w-full outline-none placeholder:text-mid-grey ${
                !isValidBitcoinAddress ? "text-red-600" : ""
              }`}
              type="text"
              value={displayAddress}
              placeholder="Your Bitcoin address"
              onChange={handleChange}
            />
            {isRecoveryAddress && (
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
    )
  );
};
