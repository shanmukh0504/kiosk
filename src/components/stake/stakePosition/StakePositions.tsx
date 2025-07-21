import { Typography } from "@gardenfi/garden-book";
import {
  StakePositionStatus,
  stakeStore,
  StakingPosition,
} from "../../../store/stakeStore";
import { StakeDetails } from "./StakeDetail";
// import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { stakePositionAnimation } from "../../../animations/animations";

// const ANIMATION_DELAY = 120;

export const StakePositions = () => {
  const { stakePosData } = stakeStore();

  const filteredRows = stakePosData
    ? stakePosData.filter(
        (item: StakingPosition) => item.status !== StakePositionStatus.unStaked
      )
    : [];

  return (
    <motion.div
      variants={stakePositionAnimation(filteredRows.length)}
      animate="animate"
      initial="initial"
      exit="exit"
      style={{ transformOrigin: "top" }}
    >
      <div className="mx-auto mb-8 mt-4 flex w-[328px] flex-col rounded-2xl bg-white/50 p-6 pt-5 sm:w-[424px] md:w-[740px]">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="border-b border-white">
              <tr>
                <th className="w-24 pb-4 pr-2 text-left">
                  <Typography size="h5" weight="medium">
                    Staked SEED
                  </Typography>
                </th>
                <th className="w-28 px-4 pb-4 text-left sm:px-2">
                  <Typography size="h5" weight="medium">
                    Duration
                  </Typography>
                </th>
                <th className="w-20 px-4 pb-4 text-left sm:px-2 sm:pl-2">
                  <Typography size="h5" weight="medium">
                    Votes
                  </Typography>
                </th>
                <th className="w-24 px-4 pb-4 text-left sm:px-2">
                  <Typography size="h5" weight="medium">
                    Multiplier
                  </Typography>
                </th>
                <th className="w-28 px-4 pb-4 text-left sm:px-2">
                  <Typography size="h5" weight="medium">
                    Rewards
                  </Typography>
                </th>
                <th className="w-28 pb-4 pr-8 text-left sm:pr-0">
                  <Typography size="h5" weight="medium">
                    End date
                  </Typography>
                </th>
                <th className="w-4"></th>
              </tr>
            </thead>
            {/* TODO: Animate the rows to fade in step by step*/}
            <tbody>
              {stakePosData && stakePosData.length > 0 ? (
                stakePosData?.map(
                  (item, index) =>
                    item.status !== StakePositionStatus.unStaked && (
                      <StakeDetails key={index} index={index} stakePos={item} />
                    )
                )
              ) : (
                <Typography
                  size="h5"
                  weight="medium"
                  className="mt-4 text-center"
                >
                  No staking position found.
                </Typography>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
