import {
  ArrowNorthEastIcon,
  Button,
  CheckIcon,
  CloseIcon,
  GardenIconOutline,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";

type ToastContainerProps = {
  className?: string;
};

export const ToastContainer: FC<ToastContainerProps> = ({ className }) => {
  const { isVisible, content, link, type, hideToast, staticToasts } =
    useToastStore();

  useEffect(() => {
    if (isVisible && (type === "success" || type === "error")) {
      const timer = setTimeout(hideToast, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, hideToast]);

  // Render static toasts (topUp, gardenPass) if they have content and should be visible
  const renderStaticToast = (toastType: "needSeed") => {
    const toast = staticToasts[toastType];
    if (!toast.content || !toast.isVisible) return null;

    return (
      <div
        key={toastType}
        className={`shine relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/25 px-4 py-2 backdrop-blur-[20px]`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center">
            <GardenIconOutline className="text-dark-grey" />
          </div>
          <Typography
            size="h4"
            breakpoints={{
              md: "h3",
            }}
            weight="regular"
          >
            {toast.content}
          </Typography>
        </div>
        {toast.link && (
          <Button
            size="sm"
            className="!h-fit !min-w-fit !rounded-full !bg-white/50 !px-3 !py-0.5 !text-sm !font-normal !text-dark-grey"
            onClick={() => window.open(toast.link, "_blank")}
          >
            Buy SEED
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-10 sm:-translate-y-[48px] ${className}`}>
      {isVisible && (
        <div
          className={`shine relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/25 px-4 py-2 backdrop-blur-[20px]`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center">
              {type === "success" ? (
                <CheckIcon />
              ) : (
                <span>
                  <CloseIcon />
                </span>
              )}
            </div>
            <Typography
              size="h4"
              breakpoints={{
                md: "h3",
              }}
              weight="regular"
            >
              {content}
            </Typography>
          </div>
          {link && (
            <Link to={link} target="_blank">
              <div className="flex h-5 w-5 items-center justify-center">
                <ArrowNorthEastIcon />
              </div>
            </Link>
          )}
        </div>
      )}

      {!isVisible && <>{renderStaticToast("needSeed")}</>}
    </div>
  );
};

export const Toast = {
  success: (content: string, link?: string) => {
    const showToast = useToastStore.getState().showToast;
    showToast("success", content, link);
  },
  error: (content: string, link?: string) => {
    const showToast = useToastStore.getState().showToast;
    showToast("error", content, link);
  },
  needSeed: (content: string, link?: string) => {
    const showStaticToast = useToastStore.getState().showStaticToast;
    showStaticToast("needSeed", content, link);
  },
};
