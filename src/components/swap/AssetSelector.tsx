import {
  ArrowLeftIcon,
  Chip,
  RadioCheckedIcon,
  SearchIcon,
  StarIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC } from "react";

type AssetSelectorProps = {
  visible: boolean;
  hide: () => void;
};

export const AssetSelector: FC<AssetSelectorProps> = ({ visible, hide }) => {
  const handleSearch = () => {
    // FIXME: Implement search
    return;
  };

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
        {/* TODO: Check why the hover state is not working */}
        <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer transition-colors hover:bg-opacity-100">
          <Typography size="h3" weight="medium">
            Ethereum
          </Typography>
        </Chip>
        <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer transition-colors hover:bg-opacity-100">
          <Typography size="h3" weight="medium">
            Arbitrum
          </Typography>
        </Chip>
        <Chip className="bg-opacity-50 px-3 py-1 cursor-pointer transition-colors hover:bg-opacity-100">
          <Typography size="h3" weight="medium">
            Solana
          </Typography>
        </Chip>
      </div>
      <div className="flex justify-between items-center bg-white rounded-2xl w-full px-4 py-2">
        <div className="flex-grow">
          <Typography size="h4" weight="medium">
            <input
              // TODO: Check why the placeholder is not working
              className="w-full outline-none placeholder:text-mid-grey"
              type="text"
              placeholder="Swap by name or ticker"
              onChange={handleSearch}
            />
          </Typography>
        </div>
        <SearchIcon />
      </div>
      <div className="flex flex-col gap-3 bg-white rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Assets
        </Typography>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Typography size="h4" weight="medium">
              BTC
            </Typography>
            <Typography className="text-mid-grey" size="h4" weight="medium">
              Bitcoin
            </Typography>
          </div>
          {/* TODO: Check why the fill is not working */}
          <StarIcon fill="light-grey" />{" "}
        </div>
      </div>
    </div>
  );
};
