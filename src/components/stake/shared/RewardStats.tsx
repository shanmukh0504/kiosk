import { ArrowRightIcon, Typography } from "@gardenfi/garden-book";
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
  valueSize?: "h1" | "h2" | "h3" | "h4" | "h5";
  extend?: boolean;
  previousValue?: ReactNode;
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
  valueSize = "h3",
  extend = false,
  previousValue,
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
      {!extend ? (
        <Typography
          size={valueSize}
          weight={weight}
          className={`sm:!gf-leading-[20px] whitespace-nowrap`}
          style={{ color: textColor }}
        >
          {value}
        </Typography>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Typography
            size={valueSize}
            weight={weight}
            className={`sm:!gf-leading-[20px] whitespace-nowrap`}
            style={{ color: textColor }}
          >
            {previousValue ?? value}
          </Typography>
          <ArrowRightIcon className="h-4 w-4" />
          <Typography
            size={valueSize}
            weight={weight}
            className={`sm:!gf-leading-[20px] whitespace-nowrap`}
            style={{ color: textColor }}
          >
            {previousValue && Number(previousValue) > Number(value)
              ? previousValue
              : value}
          </Typography>
        </div>
      )}
      {isHovered && targetRef && (
        <TooltipWrapper offsetX={10} offsetY={12} targetRef={targetRef}>
          {toolTip}
        </TooltipWrapper>
      )}
    </div>
  );
};
