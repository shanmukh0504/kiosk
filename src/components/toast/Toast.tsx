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

  if (!isVisible) return null;

  return (
    <div
      className={`shine flex justify-between items-center bg-white/25 backdrop-blur-[20px] rounded-2xl relative overflow-hidden px-4 py-2`}
    >
      <div className="flex items-center gap-2">
        <div className="flex justify-center items-center w-5 h-5">
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
          <div className="flex justify-center items-center w-5 h-5">
            <ArrowNorthEastIcon />
          </div>
        </Link>
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
