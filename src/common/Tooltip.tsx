import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { PlacesType, Tooltip as ReactTooltip } from "react-tooltip";

type TooltipProps = {
  id?: string;
  place?: PlacesType;
  content?: string;
  multiline?: boolean;
};

export const Tooltip: FC<TooltipProps> = ({
  id,
  place,
  content,
  multiline,
}) => {
  return (
    <Typography size="h5" weight="medium">
      <ReactTooltip
        id={id}
        className={`tooltip ${multiline ? "multiline" : ""}`}
        place={place}
        content={content}
      />
    </Typography>
  );
};
