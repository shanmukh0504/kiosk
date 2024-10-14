import { Chip, RadioCheckedIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";

type PartnerChipProps = {
    name: string,
    logo: React.ReactNode,
};

export const PartnerChip: FC<PartnerChipProps> = ({ name, logo }) => {
    return (
        <Chip className="bg-white/50 px-2 py-1.5">
            {logo}
            <Typography size="h3" weight="medium">
                {name}
            </Typography>
            <RadioCheckedIcon />
        </Chip>
    );
};
