import {
  ArrowNorthEastIcon,
  CheckIcon,
  CloseIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";

export const ToastContainer: FC = () => {
  const { isVisible, content, link, type, hideToast } = useToastStore();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(hideToast, 10000);
      return () => clearTimeout(timer); // Clear timeout if component unmounts
    }
  }, [isVisible, hideToast]);

  return (
    <div className="min-h-10 lg:-translate-y-[48px]">
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
            <Typography size="h3" weight="medium">
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
};
