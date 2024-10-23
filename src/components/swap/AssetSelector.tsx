import {
  ArrowLeftIcon,
  Chip,
  RadioCheckedIcon,
  SearchIcon,
  StarIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useEffect, useMemo, useState } from "react";
import { Asset, Chain } from "../../constants/constants";
import { assetInfoStore } from "../../store/assetInfoStore";

type AssetSelectorProps = {
  visible: boolean;
  hide: () => void;
  setAsset: React.Dispatch<React.SetStateAction<Asset | undefined>>;
};

export const AssetSelector: FC<AssetSelectorProps> = ({
  visible,
  hide,
  setAsset,
}) => {
  const { assetsData, fetchAssetsData } = assetInfoStore();

  const networks = useMemo(() => {
    if (assetsData) {
      return assetsData.data.networks;
    }
  }, [assetsData]);

  const [supportedChains, setSupportedChains] = useState<Chain[]>([]);
  const [supportedAssets, setSupportedAssets] = useState<Asset[]>([]);
  const [chain, setChain] = useState<Chain>();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Asset[]>([]);

  useEffect(() => {
    void fetchAssetsData();
  }, [fetchAssetsData]);

  // Once the data has been fetched, initialise the supported chains and assets
  useEffect(() => {
    if (!networks) return;

    const supportedChains: Chain[] = [];
    const supportedAssets: Asset[] = [];
    for (const [, chainInfo] of Object.entries(networks)) {
      if (chainInfo.networkType !== "mainnet") {
        continue;
      }
      supportedChains.push({
        icon: chainInfo.networkLogo,
        chainId: chainInfo.chainId,
        name: "Ethereum", // TODO: Update this once new field has been created
      });
      for (const asset of chainInfo.assetConfig) {
        supportedAssets.push({
          icon: asset.logo,
          ticker: asset.symbol,
          name: asset.name,
          chainId: chainInfo.chainId,
          decimals: asset.decimals,
        });
      }
    }
    setSupportedChains(supportedChains);
    setSupportedAssets(supportedAssets);
    setResults(supportedAssets);
  }, [networks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const r = supportedAssets.filter(
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
      setChain(undefined);
      setInput("");
      setResults(supportedAssets);
    }, 700);
  };

  return (
    <div
      className={`flex flex-col gap-3
        bg-primary-lighter rounded-[20px]
        absolute top-0 ${visible ? "left-0" : "left-full"} z-10
        h-full w-full p-3
        transition-left ease-cubic-in-out duration-700`}
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
      <div className="flex flex-wrap gap-3">
        {supportedChains?.map((c, i) => (
          <Chip
            key={i}
            // TODO: Check why the hover state is not working
            className={`${(!chain || c.chainId !== chain.chainId) ? "bg-opacity-50 pr-1" : "pr-2"} pl-3 py-1 cursor-pointer transition-colors ease-cubic-in-out hover:bg-opacity-100`}
            onClick={() => (c === chain ? setChain(undefined) : setChain(c))}
          >
            <Typography size="h3" weight="medium">
              {c.name}
            </Typography>
            <RadioCheckedIcon className={`${c === chain ? "w-4" : "w-0"} transition-all`} fill="#E36492" />
          </Chip>
        ))}
      </div>
      <div className="flex justify-between items-center bg-white rounded-2xl w-full px-4 py-2">
        <div className="flex-grow">
          <Typography size="h4" weight="medium">
            <input
              className="w-full focus:outline-none placeholder:text-mid-grey"
              type="text"
              value={input}
              placeholder="Search by name or ticker"
              onChange={handleSearch}
            />
          </Typography>
        </div>
        <SearchIcon />
      </div>
      <div className="flex flex-col bg-white rounded-2xl h-full overflow-scroll">
        <div className="px-4 pt-4 pb-1.5">
          <Typography size="h5" weight="bold">
            Assets
          </Typography>
        </div>
        {results?.map(
          (asset, i) =>
            (!chain || asset.chainId === chain.chainId) && (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-1.5 cursor-pointer hover:bg-off-white"
                onClick={() => handleClick(asset)}
              >
                <div className="flex items-center gap-2">
                  <img src={asset.icon} className="w-5 h-5" />
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
                <StarIcon fill="light-grey" />
              </div>
            ),
        )}
      </div>
    </div>
  );
};
