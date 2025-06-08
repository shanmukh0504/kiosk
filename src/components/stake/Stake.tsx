import { FC } from "react";
import { stakeStore, StakeType } from "../../store/stakeStore";
import { StakeOverview } from "./StakeOverview";
import { ToastContainer } from "../toast/Toast";
import { StakePositions } from "./stakePosition/StakePositions";
import { AnimatePresence } from "framer-motion";
import { StakeComponent } from "./StakeComponent";
import { GardenPass } from "./shared/GardenPass";
import { StakeRewards } from "./StakeRewards";

export const Stake: FC = () => {
  const { stakePosData, stakeType } = stakeStore();

  return (
    <div className="mb-8 mt-10 flex flex-col gap-6 sm:mb-16">
      <div className="mx-auto mt-10 flex flex-col gap-6">
        <ToastContainer />
        <div className="flex h-full w-full items-center">
          <AnimatePresence mode="wait">
            {stakeType === StakeType.GARDEN_PASS && <GardenPass />}
          </AnimatePresence>
          <StakeComponent />
        </div>
      </div>
      {stakePosData && stakePosData.length > 0 && (
        <AnimatePresence>
          <div className="z-0 flex flex-col gap-6">
            <StakeRewards />
            <StakeOverview />
            <StakePositions />
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};
