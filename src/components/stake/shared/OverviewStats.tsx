import {
  ArrowDownwardIcon,
  ArrowUpwardIcon,
  InfoIcon,
  Typography,
} from "@gardenfi/garden-book";
import React, { FC, ReactNode, useState } from "react";
import { viewPortStore } from "../../../store/viewPortStore";
import { TooltipWrapper } from "./ToolTipWrapper";

type props = {
  title: string;
  value: string | number;
  size?: "xs" | "sm" | "md";
  isPink?: boolean;
  className?: string;
  info?: boolean;
  toolTip?: ReactNode;
  targetRef?: React.RefObject<HTMLDivElement>;
  showStat?: boolean;
};

export const OverviewStats: FC<props> = ({
  title,
  value,
  size = "sm",
  isPink = false,
  className,
  info,
  toolTip,
  targetRef,
  showStat = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isTab } = viewPortStore();
  const textColor = isPink ? "!text-rose" : "!text-dark-grey";
  const titleSize = size === "xs" ? "h5" : size === "sm" ? "h5" : "h4";
  const valueSize = "h4";
  const valueBreakpoints =
    size === "md"
      ? ({ xs: "h2", sm: "h1" } as const)
      : size === "sm"
        ? ({ xs: "h3", sm: isTab ? "h2" : "h4" } as const)
        : ({ xs: "h4", sm: "h3" } as const);

  return (
    <div
      className={`relative flex flex-col items-start justify-center gap-y-1 ${className}`}
    >
      <Typography
        size={titleSize}
        breakpoints={{
          xs: "h5",
          sm: titleSize,
        }}
        weight={size === "xs" ? "medium" : "bold"}
        className={`${textColor} flex items-center gap-0.5 whitespace-nowrap`}
      >
        {title}
        {info && (
          <span
            ref={targetRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-block cursor-pointer"
          >
            <InfoIcon className="h-3 w-3" />
            {isHovered && toolTip && targetRef && (
              <TooltipWrapper targetRef={targetRef}>{toolTip}</TooltipWrapper>
            )}
          </span>
        )}
      </Typography>
      <Typography
        size={valueSize}
        breakpoints={valueBreakpoints}
        weight={size === "xs" || size === "sm" ? "medium" : "bold"}
        className={`${textColor} flex items-center gap-1 lg:whitespace-nowrap`}
      >
        {Number(value) < 0 ? value?.toString().slice(1) : value}
        {showStat &&
          (Number(String(value).replace(/[^0-9.-]+/g, "")) > 0 ? (
            <ArrowUpwardIcon className="h-3 w-3 !fill-light-green" />
          ) : (
            <ArrowDownwardIcon className="h-3 w-3 !fill-red-500" />
          ))}
      </Typography>
    </div>
  );
};
