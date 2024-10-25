import { ArrowLeftIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
// import { SwapInfo } from "../../common/SwapInfo";

type SwapFeesComparisonProps = {
  visible: boolean;
  hide: () => void;
};

export const SwapFeesComparison: FC<SwapFeesComparisonProps> = ({
  visible,
  hide,
}) => {
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
      <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
        {/* <SwapInfo
          sendAmount={swap.sendAmount}
          receiveAmount={swap.receiveAmount}
          sendAsset={swap.sendAsset}
          receiveAsset={swap.receiveAsset}
        /> */}
      </div>
      <div className="flex gap-10 bg-white rounded-2xl p-4">
        <div className="flex flex-col flex-grow gap-2">
          <Typography className="p-1" size="h5" weight="bold">
            Routes
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            garden
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            THORSwap
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Typography className="p-1" size="h5" weight="bold">
            ETA
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            ~2m 30s
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            ~12m 19s
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Typography className="p-1" size="h5" weight="bold">
            Cost
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            $201.31
          </Typography>
          <Typography className="p-1" size="h4" weight="medium">
            $601.31
          </Typography>
        </div>
      </div>
    </div>
  );
};
