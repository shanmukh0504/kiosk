import { Typography } from "@gardenfi/garden-book";
import { StakePositionStatus, stakeStore } from "../../../store/stakeStore";
import { StakeDetails } from "./StakeDetail";
import { motion } from "framer-motion";

export const StakePositions = () => {
  const { stakePosData } = stakeStore();

  return (
    <motion.div
      animate={{
        scale: ["80%", "100%"],
        margin: ["-1.65%", "0%"],
        opacity: ["0%", "100%"],
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
      style={{ transformOrigin: "top" }}
    >
      <div className="mx-auto mb-8 flex w-[328px] flex-col rounded-2xl bg-white/50 p-6 sm:w-[424px] md:w-[740px] lg:w-[1000px]">
        <Typography size="h5" weight="medium">
          Staking positions
        </Typography>
        <div>
          {stakePosData && stakePosData.length > 0 ? (
            stakePosData?.map(
              (item, index) =>
                item.status !== StakePositionStatus.unStaked && (
                  <div key={index}>
                    <StakeDetails key={index} stakePos={item} />
                    {index !== stakePosData.length - 1 && (
                      <div className="h-[1px] w-full bg-white/75" />
                    )}
                  </div>
                )
            )
          ) : (
            <Typography size="h5" weight="regular" className="mt-4 text-center">
              No staking position found.
            </Typography>
          )}
        </div>
      </div>
    </motion.div>
  );
};
