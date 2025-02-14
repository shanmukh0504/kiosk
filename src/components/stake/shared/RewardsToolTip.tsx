import { AssetChainLogos, Typography } from "@gardenfi/garden-book";
import { motion } from "framer-motion";
import {
  REWARD_CHAIN,
  REWARD_CONFIG,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../constants";

type TooltipProps = {
  seed: number | null;
  cbBtc: number | null;
};

export const RewardsToolTip = ({ seed, cbBtc }: TooltipProps) => {
  const handleRedirect = (explorer: string, address: string) => {
    window.open(`${explorer}/address/${address}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mx-auto flex"
    >
      <div className="absolute z-50 mb-[15px] ml-4 mt-[-5px] h-[14px] w-[14px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-5px] sm:mt-[15px]"></div>
      <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-custom">
        <Typography size="h5" weight="bold" className="!text-mid-grey">
          Breakdown
        </Typography>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Typography size="h4" weight="medium" className="w-[70px]">
              {cbBtc}
            </Typography>
            <Typography
              size="h4"
              weight="medium"
              className={`relative w-11 before:absolute before:h-[1px] before:w-full before:translate-y-5 before:bg-transparent hover:before:bg-dark-grey`}
              onClick={() =>
                handleRedirect(
                  REWARD_CONFIG[REWARD_CHAIN].EXPLORER,
                  REWARD_CONFIG[REWARD_CHAIN].REWARD_TOKEN_ADDRESS
                )
              }
            >
              cbBTC
            </Typography>
            <AssetChainLogos
              tokenLogo={REWARD_CONFIG[REWARD_CHAIN].TOKEN_LOGO}
              chainLogo={REWARD_CONFIG[REWARD_CHAIN].CHAIN_LOGO}
              className="scale-[0.8054]"
            />
          </div>
          <div className="flex gap-2">
            <Typography size="h4" weight="medium" className="w-[70px]">
              {seed && seed.toFixed(3)}
            </Typography>
            <Typography
              size="h4"
              weight="medium"
              className={`relative mr-2 w-9 before:absolute before:h-[1px] before:w-full before:translate-y-5 before:bg-transparent hover:before:bg-dark-grey`}
              onClick={() =>
                handleRedirect(
                  STAKING_CONFIG[STAKING_CHAIN].EXPLORER,
                  STAKING_CONFIG[STAKING_CHAIN].SEED_ADDRESS
                )
              }
            >
              SEED
            </Typography>
            <AssetChainLogos
              tokenLogo={STAKING_CONFIG[STAKING_CHAIN].TOKEN_LOGO}
              chainLogo={STAKING_CONFIG[STAKING_CHAIN].CHAIN_LOGO}
              className="scale-[0.8054]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
