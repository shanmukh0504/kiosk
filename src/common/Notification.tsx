import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LOCAL_STORAGE_KEYS } from "../constants/constants";
import { notificationStore } from "../store/notificationStore";

export const Notification = () => {
  const [visible, setVisible] = useState(false);
  const { notification } = notificationStore();

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }
    const savedNotificationId = localStorage.getItem(
      LOCAL_STORAGE_KEYS.notification
    );

    if (savedNotificationId !== notification?.id) setVisible(true);
  }, [notification]);

  const handleClose = () => {
    if (notification) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.notification, notification?.id);
    }
    setVisible(false);
  };

  return (
    <div
      className={`fixed bottom-10 left-2 right-2 z-40 bg-white/50 p-4 backdrop-blur-[20px] transition-[border-radius,width,height,transform] duration-300 ease-cubic-in-out sm:bottom-10 sm:left-10 ${
        visible
          ? "h-24 w-[344px] rounded-2xl sm:w-[460px]"
          : "h-12 w-12 cursor-pointer rounded-3xl hover:scale-105"
      }`}
      onClick={() => notification && !visible && setVisible(true)}
    >
      {/* TODO: Replace with bell icon once added to garden-book */}
      <div
        className={`flex items-center justify-center transition-[opacity,height,width] ease-cubic-in-out ${
          visible
            ? // On open, fade out the bell icon
              "h-0 opacity-0"
            : // On close, fade in the bell icon once the notification has collapsed
              "h-full opacity-100 delay-300"
        }`}
      >
        <svg
          width="16"
          height="20"
          viewBox="0 0 16 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 17V15H2V8C2 6.61667 2.41667 5.3875 3.25 4.3125C4.08333 3.2375 5.16667 2.53333 6.5 2.2V1.5C6.5 1.08333 6.64583 0.729167 6.9375 0.4375C7.22917 0.145833 7.58333 0 8 0C8.41667 0 8.77083 0.145833 9.0625 0.4375C9.35417 0.729167 9.5 1.08333 9.5 1.5V2.2C10.8333 2.53333 11.9167 3.2375 12.75 4.3125C13.5833 5.3875 14 6.61667 14 8V15H16V17H0ZM8 20C7.45 20 6.97917 19.8042 6.5875 19.4125C6.19583 19.0208 6 18.55 6 18H10C10 18.55 9.80417 19.0208 9.4125 19.4125C9.02083 19.8042 8.55 20 8 20ZM4 15H12V8C12 6.9 11.6083 5.95833 10.825 5.175C10.0417 4.39167 9.1 4 8 4C6.9 4 5.95833 4.39167 5.175 5.175C4.39167 5.95833 4 6.9 4 8V15Z"
            fill="#554B6A"
          />
        </svg>
      </div>
      {notification && (
        <div
          className={`flex justify-between gap-3 ${
            visible
              ? // On open, fade in the content once the notification has expanded
                "h-full w-full opacity-100 transition-opacity delay-300 duration-300"
              : // On close, fade out the content, then the height and width
                "pointer-events-none h-0 w-0 opacity-0 [transition:opacity_150ms,width_150ms_150ms,height_150ms_150ms]"
          }`}
        >
          <Link to={notification.link} target="_blank">
            <img
              src={notification.image}
              className="h-16 w-[113px] rounded-lg object-cover"
            />
          </Link>
          <div className={`flex grow gap-1`}>
            <Link
              to={notification.link}
              target="_blank"
              className="flex w-fit max-w-[306px] flex-col gap-1 leading-4"
            >
              <Typography size="h4" weight="bold">
                {notification.title}
              </Typography>
              <Typography
                className="whitespace-wrap mb-1 inline-block overflow-hidden text-ellipsis text-mid-grey"
                size="h5"
                weight="medium"
              >
                {notification.description}
              </Typography>
            </Link>
          </div>
          <div className="flex h-5 w-[22px] items-center justify-center">
            <CloseIcon className="cursor-pointer" onClick={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
};
