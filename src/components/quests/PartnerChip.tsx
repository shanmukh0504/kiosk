import { Chip, GMXLogo, RadioCheckedIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";

type PartnerChipProps = {
    name: string,
};

export const PartnerChip: FC<PartnerChipProps> = ({ name }) => {
    return (
        <Chip className="bg-white/50 px-2 py-1.5">
            {/* TODO: Make this logo customisable */}
            <GMXLogo />
            <Typography size="h3" weight="medium">
                {name}
            </Typography>
            <RadioCheckedIcon />
        </Chip>
    );
};
