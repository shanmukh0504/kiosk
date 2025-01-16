import { Typography } from "@gardenfi/garden-book";
import { FC, ReactNode } from "react";

type props = {
  title: ReactNode;
  value: ReactNode;
  size?: "xs" | "sm" | "md";
  isPink?: boolean;
  className?: string;
};

export const StakeStats: FC<props> = ({
  title,
  value,
  size = "sm",
  isPink = false,
  className,
}) => {
  const textColor = isPink ? "!text-rose" : "!text-dark-grey";

  return (
    <div
      className={`flex flex-col items-start justify-center gap-y-1 ${className}`}
    >
      <Typography
        size={size === "xs" ? "h5" : size === "sm" ? "h5" : "h4"}
        weight={size === "xs" ? "medium" : "bold"}
        className={`${textColor} whitespace-nowrap`}
      >
        {title}
      </Typography>
      <Typography
        size={size === "xs" ? "h3" : size === "sm" ? "h2" : "h1"}
        weight={size === "xs" ? "medium" : size === "sm" ? "medium" : "bold"}
        className={textColor}
      >
        {value}
      </Typography>
    </div>
  );
};
