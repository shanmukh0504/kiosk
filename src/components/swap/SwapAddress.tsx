import { FC } from "react";
import { Typography } from "@gardenfi/garden-book";

export const SwapAddress: FC = () => {
  return (
    <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
      <Typography size="h5" weight="bold">
        Refund address
      </Typography>
      <Typography size="h3" weight="medium">
        <input
          // TODO: Check why the placeholder is not working
          className="flex-grow outline-none placeholder:text-mid-grey"
          type="text"
          placeholder="Your Bitcoin address"
        />
      </Typography>
    </div>
  );
};
