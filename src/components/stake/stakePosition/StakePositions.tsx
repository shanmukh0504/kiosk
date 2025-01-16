import { Typography } from "@gardenfi/garden-book";
import { StakePositionStatus, stakeStore } from "../../../store/stakeStore";
import { StakeDetails } from "./StakeDetail";

export const StakePositions = () => {
  const { stakePosData } = stakeStore();

  return (
    <div className="flex flex-col w-[328px] sm:w-[424px] md:w-[740px] mb-8 rounded-2xl bg-opacity-50 bg-white mx-auto p-6">
      <Typography size="h5" weight="bold">
        Staking Positions
      </Typography>
      <div>
        {stakePosData && stakePosData.length > 0 ? (
          stakePosData?.map(
            (item, index) =>
              item.status !== StakePositionStatus.unStaked && (
                <div key={index}>
                  <StakeDetails key={index} stakePos={item} />
                  {index !== stakePosData.length - 1 && (
                    <div className="bg-white/75 h-[1px] w-full" />
                  )}
                </div>
              )
          )
        ) : (
          <Typography size="h5" weight="medium" className="mt-4 text-center">
            No staking position found
          </Typography>
        )}
      </div>
    </div>
  );
};
