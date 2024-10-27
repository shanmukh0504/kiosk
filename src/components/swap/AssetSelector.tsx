import {
  ArrowLeftIcon,
  Chip,
  RadioCheckedIcon,
  SearchIcon,
  StarIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useEffect, useState } from "react";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { assetInfoStore, ChainData } from "../../store/assetInfoStore";
import { swapStore } from "../../store/swapStore";
import { IOType } from "../../constants/constants";
import { constructOrderPair } from "@gardenfi/core";

export const AssetSelector = () => {
  const [chain, setChain] = useState<ChainData>();
  const [input, setInput] = useState<string>();
  const [results, setResults] = useState<Asset[]>();

  const {
    isAssetSelectorOpen,
    CloseAssetSelector,
    assets,
    chains,
    strategies,
  } = assetInfoStore();
  const { setAsset, inputAsset, outputAsset } = swapStore();

  const comparisonToken =
    isAssetSelectorOpen.type === IOType.input ? outputAsset : inputAsset;

  useEffect(() => {
    if (!assets || !strategies.val) return;
    if (!comparisonToken) setResults(Object.values(assets));
    else {
      const supportedTokens = Object.values(assets).filter((asset) => {
        const op =
          isAssetSelectorOpen.type === IOType.input
            ? constructOrderPair(
                asset.chain,
                asset.atomicSwapAddress,
                comparisonToken.chain,
                comparisonToken.atomicSwapAddress,
              )
            : constructOrderPair(
                comparisonToken.chain,
                comparisonToken.atomicSwapAddress,
                asset.chain,
                asset.atomicSwapAddress,
              );
        return strategies.val && strategies.val[op] !== undefined;
      });
      setResults(supportedTokens);
    }
  }, [assets, strategies.val, isAssetSelectorOpen.type]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!assets) return;

    const input = e.target.value;
    const r = Object.values(assets).filter(
      (asset) =>
        asset.name?.toLowerCase().includes(input) ||
        asset.symbol?.toLowerCase().includes(input),
    );
    setInput(input);
    setResults(r);
  };

  const handleClick = (asset?: Asset) => {
    if (asset) setAsset(isAssetSelectorOpen.type, asset);

    CloseAssetSelector();
    // Clear inputs after delay
    setTimeout(() => {
      setChain(undefined);
      setInput("");
      if (assets) setResults(Object.values(assets));
    }, 700);
  };

  return (
    <div
      className={`flex flex-col gap-3
        bg-primary-lighter rounded-[20px]
        absolute top-0 ${
          isAssetSelectorOpen.isOpen ? "left-0" : "left-full"
        } z-10
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
        {chains &&
          Object.values(chains).map((c, i) => (
            // TODO: Chip component should ideally have a `checked` prop that
            // automatically adds the below styles
            <Chip
              key={i}
              className={`${
                !chain || c.chainId !== chain.chainId
                  ? "bg-opacity-50 pr-1"
                  : "pr-2"
              } pl-3 py-1 cursor-pointer transition-colors ease-cubic-in-out hover:bg-opacity-50`}
              onClick={() => (c === chain ? setChain(undefined) : setChain(c))}
            >
              <Typography size="h3" weight="medium">
                {c.name}
              </Typography>
              <RadioCheckedIcon
                className={`${
                  c === chain ? "w-4" : "w-0"
                } transition-all fill-rose`}
              />
            </Chip>
          ))}
      </div>
      <div className="flex justify-between items-center bg-white rounded-2xl w-full px-4 py-2">
        <div className="flex-grow">
          <Typography size="h4" weight="medium">
            <input
              className="w-full outline-none placeholder:text-mid-grey"
              type="text"
              value={input}
              placeholder="Search by name or ticker"
              onChange={handleSearch}
            />
          </Typography>
        </div>
        <SearchIcon />
      </div>
      <div className="flex flex-col bg-white rounded-2xl h-full overflow-auto">
        <div className="px-4 pt-4 pb-1.5">
          <Typography size="h5" weight="bold">
            Assets
          </Typography>
        </div>
        {results?.map((asset, i) => {
          const network = !isBitcoin(asset.chain) && chains?.[asset.chain];
          return (
            (!chain || asset.chain === chain.identifier) && (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-1.5 cursor-pointer hover:bg-off-white"
                onClick={() => handleClick(asset)}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src={asset.logo} className="w-5 h-5" />
                    {network && (
                      <img
                        src={network.networkLogo}
                        className="absolute w-3 h-3 bottom-0 right-0"
                      />
                    )}
                  </div>
                  <Typography size="h4" weight="medium">
                    {asset.symbol}
                  </Typography>
                  <Typography
                    className="text-mid-grey"
                    size="h4"
                    weight="medium"
                  >
                    {asset.name}
                  </Typography>
                </div>
                <StarIcon className="fill-light-grey" />
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};
