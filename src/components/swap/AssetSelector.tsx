import {
  ArrowLeftIcon,
  Chip,
  RadioCheckedIcon,
  SearchIcon,
  StarIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { Asset, SupportedAssets } from "../../constants/constants";

type AssetSelectorProps = {
  visible: boolean;
  hide: () => void;
  setAsset: React.Dispatch<React.SetStateAction<Asset>>;
};

// TODO: Replace this list with values fetched from the API.
const chains = ["Bitcoin", "Ethereum", "Arbitrum", "Solana"];

export const AssetSelector: FC<AssetSelectorProps> = ({
  visible,
  hide,
  setAsset,
}) => {
  const assets = Object.entries(SupportedAssets).map(([, v]) => v);

  const [chain, setChain] = useState("");
  const [input, setInput] = useState("");
  const [results, setResults] = useState(assets);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const r = assets.filter(
      (asset) =>
        asset.name?.toLowerCase().includes(input) ||
        asset.ticker?.toLowerCase().includes(input),
    );
    setInput(input);
    setResults(r);
  };

  const handleClick = (asset?: Asset) => {
    if (asset) setAsset(asset);
    hide();

    // Clear inputs after delay
    setTimeout(() => {
      setInput("");
      setResults(assets);
    }, 700);
  };

  return (
    <div
      // TODO: Use variable name for background color
      className={`flex flex-col gap-3
        bg-primary-lighter rounded-[20px]
        absolute top-0 ${visible ? "left-0" : "left-full"} z-10
        h-full w-full p-3
        transition-left ease-in-out duration-700`}
    >
      <div className="flex justify-between items-center p-1">
        <Typography size="h4" weight="bold">
          Token select
        </Typography>
        <ArrowLeftIcon
          className="cursor-pointer"
          onClick={() => handleClick()}
        />
      </div>
      <div className="flex gap-3">
        {chains.map((c, i) => (
          <>
            {/* TODO: Check why the hover state is not working */}
            <Chip
              key={i}
              className={`${c !== chain && "bg-opacity-50"} px-3 py-1 cursor-pointer transition-colors hover:bg-opacity-100`}
              onClick={() => (c === chain ? setChain("") : setChain(c))}
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
              value={input}
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
        {results.map(
          (asset, i) =>
            (chain === "" || asset.chain === chain) && (
              <div key={i} className="flex justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleClick(asset)}
                >
                  {asset.icon}
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
