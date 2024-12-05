import { Typography } from "@gardenfi/garden-book";

export const StakeInfoCard = ({
    title,
    value,
    isPink = false,
}: {
    title: string;
    value: string;
    isPink?: boolean;
}) => {
    const textColor = isPink ? "!text-rose" : "!text-dark-grey";

    return (
        <div className="flex flex-col items-start justify-center gap-y-1">
            <Typography size="h4" weight="bold" className={textColor}>
                {title}
            </Typography>
            <Typography size="h1" weight="bold" className={textColor}>
                {value}
            </Typography>
        </div>
    );
};
