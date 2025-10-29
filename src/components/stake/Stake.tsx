import { FC, useState } from "react";
import { stakeStore, StakeType } from "../../store/stakeStore";
import { StakeOverview } from "./StakeOverview";
import { ToastContainer } from "../toast/Toast";
import { StakePositions } from "./stakePosition/StakePositions";
import { AnimatePresence, motion } from "framer-motion";
import { StakeComponent } from "./StakeComponent";
import { GardenPass } from "./shared/GardenPass";
import { StakeRewards } from "./StakeRewards";
import { BottomSheet } from "@gardenfi/garden-book";
import { NftBottomSheet } from "./shared/NftBottomSheet";

export const Stake: FC = () => {
  const { stakePosData, stakeType } = stakeStore();
  const [showDetails, setShowDetails] = useState(false);

  const [isNftOpen, setIsNftOpen] = useState(false);
  const handleNftOpenChange = (open: boolean) => {
    setIsNftOpen(open);
  };

  return (
    <div className="mt-10 flex flex-col gap-6 pb-8 sm:pb-16">
      <div className="mx-auto mt-10 flex flex-col gap-6">
        <ToastContainer className="sm:translate-y-0" />
        <div className="flex h-full w-full flex-col items-center md:flex-row">
          <AnimatePresence mode="wait">
            {stakeType === StakeType.GARDEN_PASS && <GardenPass />}
          </AnimatePresence>
          <StakeComponent setIsNftOpen={setIsNftOpen} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {stakePosData && stakePosData.length > 0 && (
          <motion.div layout className="z-0 flex flex-col">
            <StakeRewards
              key="stake-rewards"
              showDetails={showDetails}
              setShowDetails={setShowDetails}
            />
            <AnimatePresence mode="wait">
              {showDetails && (
                <motion.div layout>
                  <StakeOverview key="stake-overview" />
                  <StakePositions key="stake-positions" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomSheet open={isNftOpen} onOpenChange={handleNftOpenChange}>
        <NftBottomSheet />
      </BottomSheet>
    </div>
  );
};
