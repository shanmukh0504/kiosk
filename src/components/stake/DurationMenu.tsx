import { FC, useState } from "react";
import { stakeStore } from "../../store/stakeStore";
import infinity from "../../../public/infinite.svg";
import { DURATION, DURATION_MAP, INFINITE } from "../../constants/stake";
import { KeyboardDownIcon, Typography } from "@gardenfi/garden-book";


const DurationMenu: FC = () => {
    const { selectedDuration, setSelectedDuration } = stakeStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelectDuration = (duration: DURATION) => {
        setSelectedDuration(duration);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full ">
            <button
                onClick={handleToggleDropdown}
                className="flex justify-between items-center w-full px-3 py-[10px] text-2xl text-dark-grey rounded-2xl bg-white cursor-pointer"
            >
                <div className="flex gap-4 items-center">
                    <Typography size="h2" weight="medium">
                        {selectedDuration === INFINITE ? (
                            <img src={infinity} alt="infinity" />
                        ) : (
                            `${selectedDuration} months`
                        )}
                    </Typography>
                    <Typography size="h4" weight="medium" className="mt-1">
                        {DURATION_MAP[selectedDuration].votes}x Multiplier
                    </Typography>
                </div>
                <KeyboardDownIcon className="mr-2" />
            </button>

            {isOpen && (
                <div className="absolute w-full mt-[-45px] bg-white shadow-2xl rounded-2xl z-10">
                    {Object.keys(DURATION_MAP).map((item) => {
                        const multiplier = DURATION_MAP[item as DURATION].votes;

                        return (
                            <div
                                key={item}
                                onClick={() => handleSelectDuration(item as DURATION)}
                                className="px-3 py-2 text-2xl transition-colors cursor-pointer hover:bg-purple-light"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <Typography size="h2" weight="medium">
                                            {item === INFINITE ? (
                                                <img src={infinity} alt="infinity" />
                                            ) : (
                                                `${item} months`
                                            )}
                                        </Typography>

                                        <Typography size="h4" weight="medium" className="text-grey">
                                            {multiplier}x Multiplier
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
            }
        </div>
    );
};

export default DurationMenu;
