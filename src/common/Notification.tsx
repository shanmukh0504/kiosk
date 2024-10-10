import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { Link } from "react-router-dom";

type NotificationProps = {
    title: string;
    description: string;
    image: string;
    link: string;
};

export const Notification: FC<NotificationProps> = ({ title, description, image, link }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div
            className={`bg-white/50 backdrop-blur-[20px]
            fixed left-10 bottom-10 p-4
            transition-[border-radius,width,height,transform] ease-cubic-in-out duration-300
            ${visible ?
                    "rounded-2xl w-[490px] h-24" :
                    "rounded-3xl w-12 h-12 cursor-pointer hover:scale-105"
                }`
            }
            onClick={() => !visible && setVisible(true)}
        >
            {/* TODO: Replace with bell icon once added to garden-book */}
            <div
                className={`flex justify-center items-center transition-[opacity,height] ease-cubic-in-out
                ${visible ?
                        // On open, fade out the bell icon
                        "opacity-0 h-0" :
                        // On close, fade in the bell icon once the notification has collapsed
                        "opacity-100 h-full delay-300"
                    }`
                }
            >
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 17V15H2V8C2 6.61667 2.41667 5.3875 3.25 4.3125C4.08333 3.2375 5.16667 2.53333 6.5 2.2V1.5C6.5 1.08333 6.64583 0.729167 6.9375 0.4375C7.22917 0.145833 7.58333 0 8 0C8.41667 0 8.77083 0.145833 9.0625 0.4375C9.35417 0.729167 9.5 1.08333 9.5 1.5V2.2C10.8333 2.53333 11.9167 3.2375 12.75 4.3125C13.5833 5.3875 14 6.61667 14 8V15H16V17H0ZM8 20C7.45 20 6.97917 19.8042 6.5875 19.4125C6.19583 19.0208 6 18.55 6 18H10C10 18.55 9.80417 19.0208 9.4125 19.4125C9.02083 19.8042 8.55 20 8 20ZM4 15H12V8C12 6.9 11.6083 5.95833 10.825 5.175C10.0417 4.39167 9.1 4 8 4C6.9 4 5.95833 4.39167 5.175 5.175C4.39167 5.95833 4 6.9 4 8V15Z" fill="#554B6A" />
                </svg>
            </div>
            <div
                className={`flex gap-3
                ${visible ?
                        // On open, fade in the content once the notification has expanded
                        "opacity-100 w-full h-full transition-opacity duration-300 delay-300" :
                        // On close, fade out the content, then the height and width
                        "opacity-0 w-0 h-0 pointer-events-none [transition:opacity_150ms,width_150ms_150ms,height_150ms_150ms]"
                    }`
                }
            >
                <Link to={link} target="_blank">
                    <img src={image} className="rounded-lg h-16 object-cover" />
                </Link>
                <div className={`flex gap-1`}>
                    <div className="flex flex-col gap-1">
                        <Link to={link} target="_blank" className="leading-4">
                            <Typography size="h4" weight="bold">
                                {title}
                            </Typography>
                        </Link>
                        <Typography
                            className="text-mid-grey inline-block w-[306px] mb-1 whitespace-nowrap overflow-hidden text-ellipsis"
                            size="h5"
                            weight="medium"
                        >
                            {description}
                        </Typography>
                    </div>
                    <div className="flex justify-center items-center w-[22px] h-5">
                        <CloseIcon
                            className="cursor-pointer"
                            onClick={() => setVisible(false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
