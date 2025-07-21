import { FC, useState } from "react";
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
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mb-8 mt-10 flex flex-col gap-6 sm:mb-16">
      <div className="mx-auto mt-10 flex flex-col gap-6">
        <ToastContainer className="lg:translate-y-0" />
        <div className="flex h-full w-full flex-col items-center md:flex-row">
          <AnimatePresence mode="wait">
            {stakeType === StakeType.GARDEN_PASS && <GardenPass />}
          </AnimatePresence>
          <StakeComponent />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {stakePosData && stakePosData.length > 0 && (
          <div className="z-0 flex flex-col">
            <StakeRewards key="stake-rewards" />
            <StakeOverview
              key="stake-overview"
              showDetails={showDetails}
              setShowDetails={setShowDetails}
            />
            <AnimatePresence mode="wait">
              {showDetails && <StakePositions key="stake-positions" />}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
