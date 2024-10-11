import { ArrowNorthEastIcon, Chip, GMXLogo, RadioCheckedIcon, RadioUncheckedIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Link } from "react-router-dom";

type QuestProps = {
    partner: string,
    description: string,
    link: string,
    amount: number;
    featured?: boolean;
};

export const Quest: FC<QuestProps> = ({
    partner,
    description,
    amount,
    link,
    featured,
}) => {
    return (
        <div className={`flex flex-col grow-0 shrink-0 ${featured ? "basis-2/3" : "basis-1/3"} bg-white/50 backdrop-blur-[20px] rounded-2xl p-6`}>
            <div className="flex justify-between">
                <Chip className="px-2 py-1.5">
                    {/* TODO: Make this logo customisable */}
                    <GMXLogo />
                    <Typography size="h3" weight="medium">
                        {partner}
                    </Typography>
                    <RadioCheckedIcon />
                </Chip>
                <div className="flex justify-center items-center w-6 h-6">
                    <Link to={link} target="_blank">
                        <ArrowNorthEastIcon className="w-[15px] h-full" />
                    </Link>
                </div>
            </div>
            <div className="grow mt-5">
                <Typography size="h3" weight="medium">
                    {description}
                </Typography>
            </div>
            <div className="flex justify-end mt-8">
                <Chip className="py-1 pl-3 pr-2">
                    <Typography size="h3" weight="medium">
                        {amount} SEED
                    </Typography>
                    <RadioUncheckedIcon />
                </Chip>
            </div>
        </div>
    );
};
