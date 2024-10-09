import { ArrowNorthEastIcon, CheckIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";

type ToastProps = {
    content: string;
};

export const Toast: FC<ToastProps> = ({ content }) => {
    return (
        <div className="shine flex justify-between items-center bg-white/25 backdrop-blur-[20px] rounded-2xl relative overflow-hidden px-4 py-2">
            <div className="flex items-center gap-2">
                <div className="flex justify-center items-center w-5 h-5">
                    <CheckIcon />
                </div>
                <Typography size="h3" weight="medium">
                    {content}
                </Typography>
            </div>
            <div className="flex justify-center items-center w-5 h-5">
                <ArrowNorthEastIcon />
            </div>
        </div>
    );
};
