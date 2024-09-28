import {
  ArrowLeftIcon,
  Chip,
  RadioCheckedIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC } from "react";

type AssetSelectorProps = {
  visible: boolean;
  hide: () => void;
};

export const AssetSelector: FC<AssetSelectorProps> = ({ visible, hide }) => {
  return (
    <div
      className={`flex flex-col gap-3 absolute top-0 ${visible ? "left-0" : "left-full"} z-10 h-full w-full p-3 transition-all`}
    >
      <div className="flex justify-between items-center p-1">
        <Typography size="h4" weight="bold">
          Token select
        </Typography>
        <ArrowLeftIcon className="cursor-pointer" onClick={() => hide()} />
      </div>
      <div className="flex gap-3">
        <Chip className="pl-3 pr-2 py-1 cursor-pointer">
          <Typography size="h3" weight="medium">
            Bitcoin
          </Typography>
          <RadioCheckedIcon />
        </Chip>
        <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer">
          <Typography size="h3" weight="medium">
            Ethereum
          </Typography>
        </Chip>
        <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer">
          <Typography size="h3" weight="medium">
            Arbitrum
          </Typography>
        </Chip>
        <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer">
          <Typography size="h3" weight="medium">
            Solana
          </Typography>
        </Chip>
      </div>
    </div>
  );
};
