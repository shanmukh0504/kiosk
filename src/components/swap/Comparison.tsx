import { ArrowLeftIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";

type ComparisonProps = {
  visible: boolean;
  hide: () => void;
};

export const Comparison: FC<ComparisonProps> = ({ visible, hide }) => {
  return (
    <div
      className={`flex flex-col gap-3
        bg-primary-lighter rounded-[20px]
        absolute top-0 ${visible ? "left-0" : "left-full"} z-10
        h-full w-full p-3
        transition-left ease-in-out duration-700`}
    >
      <div className="flex justify-between items-center p-1">
        <Typography size="h4" weight="bold">
          Cost & speed comparison
        </Typography>
        <ArrowLeftIcon className="cursor-pointer" onClick={() => hide()} />
      </div>
    </div>
  );
};
