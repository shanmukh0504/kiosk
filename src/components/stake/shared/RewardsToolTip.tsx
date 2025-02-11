import { AssetChainLogos, Typography } from "@gardenfi/garden-book";
import { motion } from "framer-motion";
import { LOGO_CONFIGS } from "../constants";

type TooltipProps = {
  seed: number | null;
  cbBtc: number | null;
};

export const RewardsToolTip = ({ seed, cbBtc }: TooltipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mx-auto flex"
    >
      <div className="absolute z-50 mb-[15px] ml-4 mt-[-5px] h-[14px] w-[14px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-5px] sm:mt-[15px]"></div>
      <div className="shadow-custom flex flex-col gap-2 rounded-2xl bg-white px-4 py-3">
        <Typography size="h5" weight="bold" className="!text-mid-grey">
          Breakdown
        </Typography>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1">
            <Typography size="h4" weight="medium">
              {cbBtc} cbBTC
            </Typography>
            <AssetChainLogos
              tokenLogo={LOGO_CONFIGS.cbBTC.token_logo}
              chainLogo={LOGO_CONFIGS.cbBTC.chain_logo}
            />
          </div>
          <div className="flex gap-1">
            <Typography size="h4" weight="medium">
              {seed} SEED
            </Typography>
            <AssetChainLogos
              tokenLogo={LOGO_CONFIGS.seed.token_logo}
              chainLogo={LOGO_CONFIGS.seed.chain_logo}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
