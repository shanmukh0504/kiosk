import { Typography } from "@gardenfi/garden-book";
import { FC, ReactNode, useState } from "react";

type props = {
  title: ReactNode;
  value: ReactNode;
  size?: "xs" | "sm" | "md";
  isPink?: boolean;
  className?: string;
  toolTip?: ReactNode;
};

export const StakeStats: FC<props> = ({
  title,
  value,
  size = "sm",
  isPink = false,
  className,
  toolTip,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const textColor = isPink ? "!text-rose" : "!text-dark-grey";
  const titleSize = size === "xs" ? "h5" : size === "sm" ? "h5" : "h4";
  const valueSize = "h4";
  const valueBreakpoints =
    size === "md"
      ? ({ xs: "h2", sm: "h1" } as const)
      : size === "sm"
        ? ({ xs: "h3", sm: "h2" } as const)
        : ({ xs: "h4", sm: "h3" } as const);

  return (
    <div
      className={`relative flex cursor-pointer flex-col items-start justify-center gap-y-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography
        size={titleSize}
        breakpoints={{
          xs: "h5",
          sm: titleSize,
        }}
        weight={size === "xs" ? "regular" : "medium"}
        className={`${textColor} whitespace-nowrap`}
      >
        {title}
      </Typography>
      <Typography
        size={valueSize}
        breakpoints={valueBreakpoints}
        weight={
          size === "xs" ? "regular" : size === "sm" ? "regular" : "medium"
        }
        className={textColor}
      >
        {value}
      </Typography>
      {isHovered && toolTip}
    </div>
  );
};
