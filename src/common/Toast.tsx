import {
  ArrowNorthEastIcon,
  CheckIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC } from "react";
import { Link } from "react-router-dom";

type ToastProps = {
  content: string;
  link?: string;
};

export const Toast: FC<ToastProps> = ({ content, link }) => {
  return (
    <div className="shine relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/25 px-4 py-2 backdrop-blur-[20px]">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center">
          <CheckIcon />
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
  );
};
