import { Typography } from "@gardenfi/garden-book";
import {
  StakePositionStatus,
  stakeStore,
  StakingPosition,
} from "../../../store/stakeStore";
import { StakeDetails } from "./StakeDetail";
// import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const animation = (length: number) => ({
  initial: {
    opacity: 0,
    height: 0,
  },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      delay: 0.2,
      // type: "spring",
      // stiffness: 200,
      // damping: 25,
      // mass: 0.5,
      duration: Math.max(0.5, 0.05 * length),
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: { type: "spring", stiffness: 400, damping: 30 },
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
});

export const StakePositions = () => {
  const { stakePosData } = stakeStore();

  const filteredRows = stakePosData
    ? stakePosData.filter(
        (item: StakingPosition) => item.status !== StakePositionStatus.unStaked
      )
    : [];

  return (
    <motion.div
      variants={animation(filteredRows.length)}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ transformOrigin: "top" }}
      className="mx-auto w-fit overflow-hidden rounded-b-2xl bg-white/25"
    >
      <div className="mx-auto flex w-[328px] flex-col pb-3 sm:w-[460px] md:w-[740px]">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/50">
              <tr>
                <th className="w-24 pb-3 pl-6 pr-2 pt-3 text-left">
                  <Typography size="h5" weight="regular">
                    Staked SEED
                  </Typography>
                </th>
                <th className="w-20 px-4 pb-3 pt-3 text-left sm:px-2 sm:pl-2">
                  <Typography size="h5" weight="regular">
                    Votes
                  </Typography>
                </th>
                <th className="w-28 px-4 pb-3 pt-3 text-left sm:px-2">
                  <Typography size="h5" weight="regular">
                    Rewards
                  </Typography>
                </th>
                <th className="w-24 px-4 pb-3 pt-3 text-left sm:px-2">
                  <Typography size="h5" weight="regular">
                    Multiplier
                  </Typography>
                </th>
                <th className="w-32 px-4 pb-3 pt-3 text-left sm:px-2 md:w-28">
                  <Typography size="h5" weight="regular">
                    Duration
                  </Typography>
                </th>
                <th className="w-28 pb-3 pr-8 pt-3 text-left sm:pr-0">
                  <Typography size="h5" weight="regular">
                    End date
                  </Typography>
                </th>
                <th className="w-8 pr-6 pt-3"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {stakePosData && stakePosData.length > 0 ? (
                  stakePosData?.map(
                    (item, index) =>
                      item.status !== StakePositionStatus.unStaked && (
                        <StakeDetails
                          key={index}
                          index={index}
                          stakePos={item}
                        />
                      )
                  )
                ) : (
                  <Typography
                    size="h5"
                    weight="regular"
                    className="mt-4 text-center"
                  >
                    No staking position found.
                  </Typography>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
