import { motion } from "framer-motion";
import {
  gardenPassContainerVariants,
  gardenPassContentVariants,
  springTransition,
} from "../../../animations/animations";
import { viewPortStore } from "../../../store/viewPortStore";
import { HoloCard } from "../../../common/HoloCard";

export const GardenPass = () => {
  const { isMobile, isSmallTab } = viewPortStore();

  return (
    !isMobile &&
    !isSmallTab && (
      <motion.div
        variants={gardenPassContainerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springTransition}
        className="relative z-0 flex max-h-[384px] min-h-[384px] items-center justify-start"
      >
        <motion.div
          variants={gardenPassContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <HoloCard
            url={"https://garden.imgix.net/nft/GardenPassBackground.png"}
            overlay={"https://garden.imgix.net/nft/GardenPassOverlay.png"}
            holoOverlay="https://garden.imgix.net/nft/GardenPassHologramOverlay.png"
            height={384}
            width={264}
            showSparkles={false}
          />
        </motion.div>
      </motion.div>
    )
  );
};
