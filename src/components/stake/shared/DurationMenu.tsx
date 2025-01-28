import { FC, useState } from "react";
import {
  InfinityIcon,
  KeyboardDownIcon,
  Typography,
} from "@gardenfi/garden-book";
import { DURATION, DURATION_MAP, INFINITE } from "../constants";
import { AnimatePresence, motion } from "framer-motion";

type DurationMenuProps = {
  selectedDuration: DURATION;
  setSelectedDuration: (duration: DURATION) => void;
};

const DurationMenu: FC<DurationMenuProps> = ({
  selectedDuration,
  setSelectedDuration,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectDuration = (duration: DURATION) => {
    setSelectedDuration(duration);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={handleToggleDropdown}
        className="flex justify-between items-center w-full px-3 py-[10px] text-2xl text-dark-grey rounded-2xl bg-white cursor-pointer outline-none"
      >
        <div className="flex gap-4 items-center">
          <Typography size="h2" weight="medium">
            {selectedDuration === INFINITE ? (
              <InfinityIcon />
            ) : (
              `${selectedDuration} months`
            )}
          </Typography>
          <Typography size="h4" weight="medium" className="mt-1">
            {DURATION_MAP[selectedDuration].votes}x Multiplier
          </Typography>
        </div>
        <KeyboardDownIcon
          className={`mr-2 z-50 duration-200 ease-in-out transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div>
            <motion.div
              animate={{
                height: ["100%", "500%"],
                transition: {
                  duration: 0.1,
                  ease: "easeInOut",
                  once: true,
                },
              }}
              exit={{
                height: ["500%", "100%"],
                transition: {
                  duration: 0.1,
                  ease: "easeOut",
                  once: true,
                },
              }}
              className="absolute w-full flex sm:flex-col flex-col-reverse translate-y-[-100%] sm:-translate-y-0 sm:-mt-[48px] bg-white shadow-2xl rounded-2xl z-10 overflow-hidden"
            >
              {Object.keys(DURATION_MAP).map((item) => {
                const multiplier = DURATION_MAP[item as DURATION].votes;

                return (
                  <div
                    key={item}
                    onClick={() => handleSelectDuration(item as DURATION)}
                    className="px-3 py-[10px] text-2xl transition-colors cursor-pointer hover:bg-off-white origin-bottom"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <Typography size="h2" weight="medium">
                          {item === INFINITE ? (
                            <InfinityIcon />
                          ) : (
                            `${item} months`
                          )}
                        </Typography>

                        <Typography
                          size="h4"
                          weight="medium"
                          className="text-grey mt-1"
                        >
                          {multiplier}x Multiplier
                        </Typography>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DurationMenu;
