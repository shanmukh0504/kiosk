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
import { viewPortStore } from "../../store/viewPortStore";

export const Stake: FC = () => {
  const { stakePosData, stakeType } = stakeStore();
  const { isMobile, isSmallTab } = viewPortStore();
  const [showDetails, setShowDetails] = useState(false);

  const [isNftOpen, setIsNftOpen] = useState(false);
  const handleNftOpenChange = (open: boolean) => {
    setIsNftOpen(open);
  };

  return (
    <div className="mt-10 flex flex-col gap-6 pb-8 sm:pb-16">
      <div className="mx-auto mt-10 flex flex-col gap-6">
        <ToastContainer className="max-w-[740px] sm:translate-y-0" />
        <motion.div
          animate={{
            translateX:
              isMobile || isSmallTab
                ? "0px"
                : stakeType === StakeType.GARDEN_PASS
                  ? "-8px"
                  : "0px",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`flex h-full w-full flex-col items-center md:flex-row`}
        >
          <AnimatePresence mode="wait">
            {stakeType === StakeType.GARDEN_PASS && <GardenPass />}
          </AnimatePresence>
          <StakeComponent setIsNftOpen={setIsNftOpen} />
        </motion.div>
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
