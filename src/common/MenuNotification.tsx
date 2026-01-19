import { Typography } from "@gardenfi/garden-book";
import { Link } from "react-router-dom";
import { NotificationProps } from "../store/notificationStore";

type MenuNotificationProps = {
  notification: NotificationProps;
};

export const MenuNotification = ({ notification }: MenuNotificationProps) => {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/50 p-2">
      <Link to={notification.link} target="_blank" rel="noreferrer">
        <img
          src={notification.image}
          className="h-16 w-16 rounded-lg object-cover"
        />
      </Link>
      <div className={`flex grow gap-1`}>
        <Link
          to={notification.link}
          target="_blank"
          rel="noreferrer"
          className="flex w-fit flex-col gap-1 leading-4"
        >
          <Typography size="h5" weight="bold">
            {notification.title}
          </Typography>
          <Typography
            className="whitespace-wrap mb-1 line-clamp-2 overflow-hidden text-ellipsis text-[10px] text-mid-grey"
            weight="medium"
          >
            {notification.description}
          </Typography>
        </Link>
      </div>
    </div>
  );
};
