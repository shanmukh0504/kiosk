import {
  ArrowLeftIcon,
  BTCLogo,
  Chip,
  RadioCheckedIcon,
  SearchIcon,
  StarIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useState } from "react";

type AssetSelectorProps = {
  visible: boolean;
  hide: () => void;
};

// TODO: Replace these lists with values fetched from the API.
const chains = ["Bitcoin", "Ethereum", "Arbitrum", "Solana"];

const assets = [
  {
    icon: BTCLogo,
    ticker: "BTC",
    name: "Bitcoin",
    chain: "Bitcoin",
  },
  {
    icon: BTCLogo,
    ticker: "WBTC",
    name: "Wrapped Bitcoin",
    chain: "Ethereum",
  },
  {
    icon: BTCLogo,
    ticker: "ETH",
    name: "Ethereum",
    chain: "Ethereum",
  },
];

export const AssetSelector: FC<AssetSelectorProps> = ({ visible, hide }) => {
  const [chain, setChain] = useState("");

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
        {chains.map((c, i) => (
          <>
            {/* TODO: Check why the hover state is not working */}
            <Chip
              key={i}
              className={`${c !== chain && "bg-opacity-50"} px-3 py-1 cursor-pointer transition-colors hover:bg-opacity-100`}
              onClick={() => setChain(c)}
            >
              <Typography size="h3" weight="medium">
                {c}
              </Typography>
              {/* TODO: Check why the fill is not working */}
              {c === chain && <RadioCheckedIcon fill="button-primary" />}
            </Chip>
          </>
        ))}
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
        {assets.map(
          (asset, i) =>
            asset.chain === chain && (
              <div key={i} className="flex justify-between">
                <div className="flex items-center gap-2">
                  <BTCLogo />
                  <Typography size="h4" weight="medium">
                    {asset.ticker}
                  </Typography>
                  <Typography
                    className="text-mid-grey"
                    size="h4"
                    weight="medium"
                  >
                    {asset.name}
                  </Typography>
                </div>
                {/* TODO: Check why the fill is not working */}
                <StarIcon fill="light-grey" />
              </div>
            ),
        )}
      </div>
    </div>
  );
};
