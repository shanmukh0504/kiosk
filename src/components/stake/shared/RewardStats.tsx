import { Typography } from "@gardenfi/garden-book";
import React, { FC, ReactNode, useState } from "react";
import { TooltipWrapper } from "./ToolTipWrapper";

type props = {
  title: ReactNode;
  value: ReactNode;
  size?: "xs" | "sm" | "md";
  weight?: "regular" | "medium";
  isPink?: boolean;
  className?: string;
  toolTip?: ReactNode;
  targetRef?: React.RefObject<HTMLDivElement>;
  textColor?: string;
};

export const RewardStats: FC<props> = ({
  title,
  value,
  size = "sm",
  weight = "regular",
  className,
  toolTip,
  targetRef,
  textColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const titleSize = size === "xs" ? "h5" : size === "sm" ? "h5" : "h4";

  return (
    <div
      className={`relative flex flex-col items-start justify-center gap-1 ${className}`}
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
        className={`whitespace-nowrap text-dark-grey`}
      >
        {title}
      </Typography>
      <Typography
        size={"h3"}
        weight={weight}
        className={`sm:!gf-leading-[20px] whitespace-nowrap`}
        style={{ color: textColor }}
      >
        {value}
      </Typography>
      {isHovered && targetRef && (
        <TooltipWrapper offsetX={10} offsetY={12} targetRef={targetRef}>
          {toolTip}
        </TooltipWrapper>
      )}
    </div>
  );
};
