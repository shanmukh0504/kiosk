import { Typography } from "@gardenfi/garden-book";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion } from "framer-motion";
import { useSwap } from "../../hooks/useSwap";
import { formatAmount } from "../../utils/utils";

type TooltipProps = {
  networkFee: number;
  protocolFee: number;
};

export const CostToolTip = ({ networkFee, protocolFee }: TooltipProps) => {
  const { inputAsset } = useSwap();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative mx-auto flex"
    >
      <div className="absolute mb-[15px] ml-4 mt-[-5px] h-[14px] w-[14px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-5px] sm:mt-[15px]"></div>
      <div className="flex min-w-[248px] flex-col rounded-2xl bg-white px-4 py-3 shadow-custom">
        <div className="flex justify-between py-1.5">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Protocol fee
          </Typography>
          <Typography size="h5" weight="medium">
            ${formatAmount(protocolFee, 0, 2)}
          </Typography>
        </div>
        <div className="flex justify-between py-1.5">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Network fee
          </Typography>
          <Typography size="h5" weight="medium">
            {inputAsset && !isBitcoin(inputAsset.chain)
              ? "Free"
              : "$" + networkFee}
          </Typography>
        </div>
      </div>
    </motion.div>
  );
};
