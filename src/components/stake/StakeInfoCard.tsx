import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";

type props = {
    title: string;
    value: string;
    isPink?: boolean;
    isStakePos?: boolean;
    className?: string;
}

export const StakeInfoCard: FC<props> = ({
    title,
    value,
    isPink = false,
    isStakePos = false,
    className
}) => {
    const textColor = isPink ? "!text-rose" : "!text-dark-grey";

    return (
        <div className={`flex flex-col items-start justify-center gap-y-1 ${className}`}>
            <Typography
                size={isStakePos ? "h5" : "h4"}
                weight={isStakePos ? "medium" : "bold"}
                className={textColor}
            >
                {title}
            </Typography>
            <Typography
                size={isStakePos ? "h3" : "h1"}
                weight={isStakePos ? "medium" : "bold"}
                className={textColor}
            >
                {value}
            </Typography>
        </div>
    );
};
