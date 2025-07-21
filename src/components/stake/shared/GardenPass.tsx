import { motion } from "framer-motion";
import {
  gardenPassContainerVariants,
  gardenPassContentVariants,
  gardenPassSmallContainerVariants,
  springTransition,
} from "../../../animations/animations";
import { ArrowNorthEastIcon, Button } from "@gardenfi/garden-book";
import { viewPortStore } from "../../../store/viewPortStore";

export const GardenPass = () => {
  const { isMobile, isSmallTab } = viewPortStore();
  return isMobile || isSmallTab ? (
    <motion.div
      variants={gardenPassSmallContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <div className="z-0 flex w-full items-center justify-between gap-3.5 overflow-hidden rounded-2xl bg-white/50 p-3 backdrop-blur-md">
        <div className="flex max-h-11 min-h-11 min-w-11 max-w-11 items-start justify-center overflow-hidden rounded-md">
          <img
            src="https://garden-finance.imgix.net/garden_pass.png"
            alt="Garden Pass"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="w-full cursor-pointer">
          <Button
            className="w-full !bg-white !py-3 !font-medium !text-rose"
            size="lg"
          >
            <span>View at OpenSea</span>
            <ArrowNorthEastIcon className="h-3 w-3 fill-rose" />
          </Button>
        </div>
      </div>
    </motion.div>
  ) : (
    <motion.div
      variants={gardenPassContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springTransition}
      className="relative z-0 flex max-h-[384px] min-h-[384px] items-center justify-start overflow-hidden rounded-xl"
    >
      <motion.div
        variants={gardenPassContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="group absolute left-0 flex h-[384px] flex-col gap-3 rounded-2xl bg-white bg-opacity-50 p-3"
      >
        <div className="h-[360px] w-[240px] rounded-xl transition-all duration-300 ease-in-out group-hover:h-[300px]">
          <img
            src="https://garden-finance.imgix.net/garden_pass.png"
            alt="Garden Pass"
            className="h-full w-full rounded-xl object-cover object-top transition-all duration-300 ease-in-out"
          />
        </div>
        <div className="w-full cursor-pointer opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
          <Button
            className="w-full !bg-white !py-3 !font-medium !text-rose"
            size="lg"
          >
            <span>View at OpenSea</span>
            <ArrowNorthEastIcon className="h-3 w-3 fill-rose" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
