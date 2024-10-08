import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Link } from "react-router-dom";

type NotificationProps = {
    title: string;
    description: string;
    image: string;
    link: string;
};

export const Notification: FC<NotificationProps> = ({ title, description, image, link }) => {
    return (
        <div className="flex gap-3
        bg-white/50 backdrop-blur-[20px] rounded-2xl
        fixed left-10 bottom-10
        w-[440px] p-4">
            <img src={image} className="w-16 object-cover" />
            <div className="flex gap-1">
                <div className="flex flex-col gap-1">
                    <Link to={link} target="_blank">
                        <Typography size="h4" weight="bold">
                            {title}
                        </Typography>
                    </Link>
                    <Typography
                        className="inline-block w-[306px] whitespace-nowrap overflow-hidden text-ellipsis"
                        size="h5"
                        weight="medium"
                    >
                        {description}
                    </Typography>
                </div>
                <div className="flex justify-center items-center w-[22px] h-5">
                    <CloseIcon />
                </div>
            </div>
        </div>
    );
};
