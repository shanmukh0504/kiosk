import { FC, useState, useEffect } from "react";
import { KeyboardDownIcon, Typography } from "@gardenfi/garden-book";
import { DURATION, DURATION_MAP, INFINITE } from "../constants";
import { AnimatePresence, motion } from "framer-motion";

type DurationMenuProps = {
  selectedDuration: DURATION;
  setSelectedDuration: (duration: DURATION) => void;
  modalOpen?: boolean;
};

const DurationMenu: FC<DurationMenuProps> = ({
  selectedDuration,
  setSelectedDuration,
  modalOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen) {
      setIsOpen(false);
    }
  }, [modalOpen]);

  const handleToggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectDuration = (duration: DURATION) => {
    setSelectedDuration(duration);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={handleToggleDropdown}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-white px-3 py-3 text-2xl text-dark-grey outline-none"
      >
        <div className="flex items-center gap-4">
          <Typography size="h2" weight="regular">
            {selectedDuration === INFINITE
              ? "♾️ months"
              : `${selectedDuration} months`}
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
                  type: "spring",
                  stiffness: 250,
                  damping: 25,
                },
              }}
              exit={{
                height: ["500%", "100%"],
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                },
              }}
              className="absolute z-10 flex w-full -translate-y-full flex-col-reverse overflow-hidden rounded-2xl bg-white shadow-2xl sm:-mt-[40px] sm:-translate-y-0 sm:flex-col"
            >
              {Object.keys(DURATION_MAP).map((item) => {
                return (
                  <div
                    key={item}
                    onClick={() => handleSelectDuration(item as DURATION)}
                    className="origin-bottom cursor-pointer px-3 py-[10px] text-2xl transition-colors hover:bg-off-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Typography size="h2" weight="regular">
                          {item === INFINITE ? "♾️ months" : `${item} months`}
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
