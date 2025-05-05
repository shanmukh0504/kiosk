import { useState, FC, useMemo } from "react";
import {
  GasStationIcon,
  KeyboardDownIcon,
  SwapHorizontalIcon,
  Typography,
} from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";
import { SwapComparison } from "./SwapComparison";
import { AddressDetails } from "./AddressDetails";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useSwap } from "../../hooks/useSwap";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion, AnimatePresence } from "framer-motion";
import { formatAmount } from "../../utils/utils";
import { formatTime } from "../../utils/timeAndFeeComparison/utils";

type SwapDetailsProps = {
  tokenPrices: TokenPrices;
};

export const SwapDetailsExpanded: FC<SwapDetailsProps> = ({ tokenPrices }) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);

  const { inputAsset, outputAsset, inputAmount, outputAmount } = useSwap();

  const animationConfig = {
    initial: { opacity: 0, height: 0 },
    animate: {
      opacity: 1,
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 160,
        damping: 25,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        type: "spring",
        stiffness: 900,
        damping: 50,
        mass: 0.2,
      },
    },
  };

  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();

  const fees = useMemo(
    () => Number(tokenPrices.input) - Number(tokenPrices.output),
    [tokenPrices]
  );

  const refundAddress = useMemo(
    () => (inputAsset && isBitcoin(inputAsset.chain) ? btcAddress : address),
    [inputAsset, btcAddress, address]
  );

  const receiveAddress = useMemo(
    () => (outputAsset && isBitcoin(outputAsset.chain) ? btcAddress : address),
    [outputAsset, btcAddress, address]
  );

  const rate = useMemo(
    () =>
      outputAmount && inputAmount
        ? Number(outputAmount) / Number(inputAmount)
        : 0,
    [outputAmount, inputAmount]
  );

  const handleShowComparison = (type: "time" | "fees") => {
    setIsShowComparison({
      isOpen: true,
      isTime: type === "time",
      isFees: type === "fees",
    });
  };

  return (
    <>
      <SwapComparison
        visible={showComparison.isOpen}
        hide={() =>
          setIsShowComparison({
            isOpen: false,
            isTime: false,
            isFees: false,
          })
        }
        isTime={showComparison.isTime}
        isFees={showComparison.isFees}
        onComparisonUpdate={(time, cost) => {
          setMaxTimeSaved(time);
          setMaxCostSaved(cost);
        }}
      />
      <div className="flex flex-col rounded-2xl bg-white/50 px-4 py-4">
        <div className="flex items-center justify-between">
          {isDetailsExpanded ? (
            <Typography size="h5" weight="bold" className="py-[2px]">
              Details
            </Typography>
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1">
                <Typography size="h5" weight="medium">
                  1
                </Typography>
                <Typography size="h5" weight="medium">
                  {inputAsset?.symbol}
                </Typography>
                <SwapHorizontalIcon />
                <Typography size="h5" weight="medium">
                  {formatAmount(rate, 0, 3)}
                </Typography>
                <Typography size="h5" weight="medium">
                  {outputAsset?.symbol}
                </Typography>
              </div>
              <div className="flex items-center gap-1">
                <GasStationIcon />
                <Typography size="h5" weight="medium">
                  {`$${formatAmount(fees + 0.23, 0, 2)}`}
                </Typography>
              </div>
            </div>
          )}
          <KeyboardDownIcon
            className={`h-4 w-4 cursor-pointer px-1 ${
              !isDetailsExpanded ? "rotate-180" : ""
            }`}
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          />
        </div>
        <AnimatePresence>
          {isDetailsExpanded && (
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 25,
                mass: 0.8,
              }}
            >
              <div className="mt-3 flex items-center justify-between gap-0 py-1">
                <Typography
                  size="h5"
                  weight="medium"
                  className="!py-[2px] !text-mid-grey"
                >
                  Network cost
                </Typography>
                <div className="flex gap-5">
                  <Typography size="h4" weight="medium">
                    $0.23
                  </Typography>
                </div>
              </div>
              <div className="flex items-center justify-between gap-0 py-1">
                <Typography
                  size="h5"
                  weight="medium"
                  className="!text-mid-grey"
                >
                  Fees (0.03%)
                </Typography>
                <div className="flex gap-5">
                  <Typography size="h4" weight="medium">
                    {fees ? "$" + formatAmount(fees, 0, 2) : ""}
                  </Typography>
                </div>
              </div>

              {(maxTimeSaved > 0 || maxCostSaved > 0) && (
                <motion.div {...animationConfig}>
                  <div
                    className="z-10 my-1 h-px bg-white"
                    {...animationConfig}
                  ></div>
                  {maxTimeSaved > 0 && (
                    <motion.div
                      key="time-saved"
                      {...animationConfig}
                      className="w-full"
                    >
                      <div
                        className="relative z-10 flex cursor-pointer items-center justify-between gap-0 hover:bg-white"
                        onClick={() => handleShowComparison("time")}
                      >
                        <Typography
                          size="h5"
                          weight="medium"
                          className="!text-mid-grey"
                        >
                          Time saved
                        </Typography>
                        <div className="flex gap-5 py-1">
                          <Typography
                            size="h4"
                            weight="medium"
                            className="!text-light-green"
                          >
                            {formatTime(maxTimeSaved)}
                          </Typography>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {maxCostSaved > 0 && (
                    <motion.div
                      key="cost-saved"
                      {...animationConfig}
                      className="w-full"
                    >
                      <div
                        className="flex cursor-pointer items-center justify-between gap-0 hover:bg-white"
                        onClick={() => handleShowComparison("fees")}
                      >
                        <Typography
                          size="h5"
                          weight="medium"
                          className="!text-mid-grey"
                        >
                          Cost saved
                        </Typography>
                        <div className="flex gap-5 py-1">
                          <Typography
                            size="h4"
                            weight="medium"
                            className="!text-light-green"
                          >
                            {`$${formatAmount(maxCostSaved, 0, 2)}`}
                          </Typography>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
              {(receiveAddress || refundAddress) && (
                <>
                  <div className="my-1 h-px bg-white"></div>
                  <div className="flex flex-col items-stretch justify-center">
                    {receiveAddress && (
                      <AddressDetails address={receiveAddress} />
                    )}
                    {refundAddress && (
                      <AddressDetails address={refundAddress} isRefund />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
