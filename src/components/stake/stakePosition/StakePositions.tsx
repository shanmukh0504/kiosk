import { Typography } from "@gardenfi/garden-book";
import { StakePositionStatus, stakeStore } from "../../../store/stakeStore";
import { StakeDetails } from "./StakeDetail";
import { AnimatePresence, motion } from "framer-motion";
// import { StakeRow } from "./StakeRow";

type StakePositionsProps = {
  showDetails: boolean;
};

export const StakePositions = ({ showDetails }: StakePositionsProps) => {
  const { stakePosData } = stakeStore();

  return (
    <AnimatePresence mode="wait">
      {showDetails && (
        <motion.div
          animate={{
            marginTop: ["0%", "24px"],
            marginBottom: ["0%", "32px"],
            opacity: ["0%", "100%"],
            height: ["0%", "100%"],
            transition: {
              duration: 0.6,
              ease: "easeInOut",
              once: true,
              opacity: {
                duration: 0.3,
                delay: 0.4,
              },
            },
          }}
          exit={{
            marginTop: ["24px", "0%"],
            marginBottom: ["32px", "0%"],
            opacity: ["100%", "0%"],
            height: ["100%", "0%"],
            transition: {
              duration: 0.3,
            },
          }}
          style={{ transformOrigin: "top" }}
        >
          <div className="mx-auto flex w-[328px] flex-col rounded-2xl bg-white/50 p-6 pt-5 sm:w-[424px] md:w-[740px]">
            <div className="no-scrollbar">
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
      )}
    </AnimatePresence>
  );
};
