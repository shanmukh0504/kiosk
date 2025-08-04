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
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-white px-3 py-[10px] text-2xl text-dark-grey outline-none"
      >
        <div className="flex items-center gap-4">
          <Typography size="h2" weight="regular">
            {selectedDuration === INFINITE ? (
              <InfinityIcon />
            ) : (
              `${selectedDuration} months`
            )}
          </Typography>
          <Typography size="h4" weight="regular" className="mt-1">
            {DURATION_MAP[selectedDuration].votes}x Multiplier
          </Typography>
        </div>
        <KeyboardDownIcon
          className={`z-50 mr-2 transition-transform duration-200 ease-in-out ${
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
              className="absolute z-10 flex w-full translate-y-[-100%] flex-col-reverse overflow-hidden rounded-2xl bg-white shadow-2xl sm:-mt-[48px] sm:-translate-y-0 sm:flex-col"
            >
              {Object.keys(DURATION_MAP).map((item) => {
                const multiplier = DURATION_MAP[item as DURATION].votes;

                return (
                  <div
                    key={item}
                    onClick={() => handleSelectDuration(item as DURATION)}
                    className="origin-bottom cursor-pointer px-3 py-[10px] text-2xl transition-colors hover:bg-off-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Typography size="h2" weight="regular">
                          {item === INFINITE ? (
                            <InfinityIcon />
                          ) : (
                            `${item} months`
                          )}
                        </Typography>

                        <Typography
                          size="h4"
                          weight="regular"
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
