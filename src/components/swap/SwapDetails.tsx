import { useState, FC, useMemo, useEffect } from "react";
import { Typography } from "@gardenfi/garden-book";
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
import debounce from "lodash.debounce";

type SwapDetailsProps = {
  tokenPrices: TokenPrices;
  isExpanded: boolean;
};

export const SwapDetails: FC<SwapDetailsProps> = ({
  tokenPrices,
  isExpanded: isExpandedProp,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedProp);
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    isTime: false,
    isFees: false,
  });
  const [maxTimeSaved, setMaxTimeSaved] = useState<number>(0);
  const [maxCostSaved, setMaxCostSaved] = useState<number>(0);

  useEffect(() => {
    if (isExpandedProp) {
      const debouncedSetExpanded = debounce(() => {
        setIsExpanded(true);
      }, 500);

      debouncedSetExpanded();

      return () => {
        debouncedSetExpanded.cancel();
      };
    } else {
      setIsExpanded(false);
    }
  }, [isExpandedProp]);

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
  const { inputAsset, outputAsset } = useSwap();

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
          setIsShowComparison({ isOpen: false, isTime: false, isFees: false })
        }
        isTime={showComparison.isTime}
        isFees={showComparison.isFees}
        onComparisonUpdate={(time, cost) => {
          setMaxTimeSaved(time);
          setMaxCostSaved(cost);
        }}
      />
      <div className="flex flex-col gap-3 rounded-2xl bg-white/50 py-4">
        <Typography size="h5" weight="bold" className="px-4 py-[2px]">
          Details
        </Typography>

        <div className="flex flex-col">
          <div className="">
            <div className="flex items-center justify-between gap-0 px-4 py-1">
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
            <div className="flex items-center justify-between gap-0 px-4 py-1">
              <Typography size="h5" weight="medium" className="!text-mid-grey">
                Fees (0.03%)
              </Typography>
              <div className="flex gap-5">
                <Typography size="h4" weight="medium">
                  {fees ? "$" + formatAmount(fees, 0, 2) : ""}
                </Typography>
              </div>
            </div>
          </div>

          <div
            className={`${isExpanded && (maxTimeSaved > 0 || maxCostSaved > 0) ? "block" : "hidden"}`}
          >
            <div className="z-10 mx-4 my-1 h-px bg-white"></div>
            <AnimatePresence mode="wait">
              {maxTimeSaved > 0 && isExpanded && (
                <motion.div
                  key="time-saved"
                  {...animationConfig}
                  className="w-full"
                >
                  <div
                    className="relative z-10 flex cursor-pointer items-center justify-between gap-0 px-4 hover:bg-white"
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
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {maxCostSaved > 0 && isExpanded && (
                <motion.div
                  key="cost-saved"
                  {...animationConfig}
                  className="w-full"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between gap-0 px-4 hover:bg-white"
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
            </AnimatePresence>
          </div>
          {(receiveAddress || refundAddress) && (
            <>
              <div className="mx-4 my-1 h-px bg-white"></div>
              <div className="flex flex-col items-stretch justify-center px-4">
                {receiveAddress && <AddressDetails address={receiveAddress} />}
                {refundAddress && (
                  <AddressDetails address={refundAddress} isRefund />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
