import { SwapHorizontalIcon, Typography } from "@gardenfi/garden-book";
import { isBitcoin } from "@gardenfi/orderbook";
import { motion } from "framer-motion";
import { useSwap } from "../../hooks/useSwap";

type TooltipProps = {
  solverFee: number;
  networkFee: number;
  protocolFee: number;
  rate: number;
};

export const CostToolTip = ({
  solverFee,
  networkFee,
  protocolFee,
  rate,
}: TooltipProps) => {
  const { inputAsset, outputAsset, outputAmount } = useSwap();
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
          <div className="flex items-center gap-1">
            <Typography size="h5" weight="medium" className="!text-mid-grey">
              1{inputAsset?.symbol}
            </Typography>
            <SwapHorizontalIcon className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1">
            <Typography size="h5" weight="medium">
              {rate} {outputAsset?.symbol}
            </Typography>
          </div>
        </div>
        <div className="flex justify-between py-1.5">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Protocol fee
          </Typography>
          <Typography size="h5" weight="medium">
            ${protocolFee}
          </Typography>
        </div>
        <div className="flex justify-between py-1.5">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Solver fee
          </Typography>
          <Typography size="h5" weight="medium">
            ${solverFee}
          </Typography>
        </div>
        <div className="flex justify-between py-1.5">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Network fee
          </Typography>
          <Typography size="h5" weight="medium">
            {outputAsset && !isBitcoin(outputAsset.chain) ? "Free" : "$"+networkFee}
          </Typography>
        </div>
        <div className="flex justify-between py-1.5">
          <Typography size="h5" weight="medium" className="!text-mid-grey">
            Min received
          </Typography>
          <Typography size="h5" weight="medium">
            {outputAmount} {outputAsset?.symbol}
          </Typography>
        </div>
      </div>
    </motion.div>
  );
};
