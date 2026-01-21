import { InfoIcon, Typography } from "@gardenfi/garden-book";
import React, { FC, ReactNode, useState } from "react";
import { TooltipWrapper } from "./ToolTipWrapper";

type props = {
  title: string;
  value: string | number;
  className?: string;
  info?: boolean;
  toolTip?: ReactNode;
  targetRef?: React.RefObject<HTMLDivElement>;
  showStat?: boolean;
  isGreen?: boolean;
};

export const OverviewStats: FC<props> = ({
  title,
  value,
  className,
  info,
  toolTip,
  targetRef,
  isGreen = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const titleSlug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <div
      className={`relative flex flex-col items-start justify-center gap-y-1 ${className}`}
    >
      <Typography
        size="h5"
        weight="regular"
        className={`flex items-center gap-0.5 whitespace-nowrap`}
      >
        {title}
        {info && (
          <span
            ref={targetRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-block cursor-pointer"
            data-testid={`${titleSlug}-info`}
          >
            <InfoIcon className="h-3 w-3" />
            {isHovered && toolTip && targetRef && (
              <TooltipWrapper targetRef={targetRef}>{toolTip}</TooltipWrapper>
            )}
          </span>
        )}
      </Typography>
      <Typography
        size="h4"
        weight="regular"
        className={`${isGreen ? "!text-green-500" : ""} flex items-center gap-1 lg:whitespace-nowrap`}
        data-testid={`${titleSlug}-value`}
      >
        {Number(value) < 0 ? value?.toString().slice(1) : value}
      </Typography>
    </div>
  );
};
