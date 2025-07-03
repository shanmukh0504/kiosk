import { AssetChainLogos, Typography } from "@gardenfi/garden-book";
import { motion } from "framer-motion";
import { STAKE_REWARD } from "../constants";
import { Url } from "@gardenfi/utils";

type TooltipProps = {
  seed: number | null;
  cbBtc: number | null;
};

export const RewardsToolTip = ({ seed, cbBtc }: TooltipProps) => {
  const handleRedirect = (addressExplorer: Url, address: string) => {
    window.open(addressExplorer.endpoint("address").endpoint(address));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative mx-auto flex"
    >
      <div className="absolute mb-[15px] ml-4 mt-[-5px] h-[14px] w-[14px] rotate-45 rounded-sm bg-white sm:mb-0 sm:ml-[-5px] sm:mt-[15px]"></div>
      <div className="flex max-w-[257px] flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-custom">
        <Typography size="h5" weight="medium">
          Total rewards represent the cumulative earnings so far, broken down by
          token.
        </Typography>
        <div className="flex flex-wrap items-center justify-between space-y-1">
          {(cbBtc ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Typography size="h4" weight="medium" className="w-[87px]">
                {cbBtc}sa
              </Typography>
              <Typography
                size="h4"
                weight="medium"
                className={`relative w-11 cursor-pointer before:absolute before:h-[1px] before:w-full before:translate-y-5 before:bg-transparent hover:before:bg-dark-grey`}
                onClick={() =>
                  handleRedirect(
                    STAKE_REWARD.CBBTC.EXPLORER,
                    STAKE_REWARD.CBBTC.REWARD_TOKEN_ADDRESS
                  )
                }
              >
                cbBTC
              </Typography>
              <AssetChainLogos
                tokenLogo={STAKE_REWARD.CBBTC.TOKEN_LOGO}
                chainLogo={STAKE_REWARD.CBBTC.CHAIN_LOGO}
                className="scale-[0.8054]"
              />
            </div>
          )}
          {(seed ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Typography size="h4" weight="medium" className="w-[87px]">
                {seed}
              </Typography>
              <Typography
                size="h4"
                weight="medium"
                className={`relative mr-2 w-9 cursor-pointer before:absolute before:h-[1px] before:w-full before:translate-y-5 before:bg-transparent hover:before:bg-dark-grey`}
                onClick={() =>
                  handleRedirect(
                    STAKE_REWARD.SEED.EXPLORER,
                    STAKE_REWARD.SEED.REWARD_TOKEN_ADDRESS
                  )
                }
              >
                SEED
              </Typography>
              <AssetChainLogos
                tokenLogo={STAKE_REWARD.SEED.TOKEN_LOGO}
                chainLogo={STAKE_REWARD.SEED.CHAIN_LOGO}
                className="scale-[0.8054]"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
