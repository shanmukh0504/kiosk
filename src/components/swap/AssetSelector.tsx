import {
  Chip,
  CloseIcon,
  RadioCheckedIcon,
  SearchIcon,
  StarIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useState, ChangeEvent, useEffect, useMemo } from "react";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { assetInfoStore, ChainData } from "../../store/assetInfoStore";
import { swapStore } from "../../store/swapStore";
import { IOType } from "../../constants/constants";
import { constructOrderPair } from "@gardenfi/core";
import { AssetChainLogos } from "../../common/AssetChainLogos";

type props = {
  onClose: () => void;
};

export const AssetSelector: FC<props> = ({ onClose }) => {
  const [chain, setChain] = useState<ChainData>();
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<Asset[]>();

  const {
    isAssetSelectorOpen,
    CloseAssetSelector,
    assets,
    chains,
    strategies,
  } = assetInfoStore();
  const { setAsset, inputAsset, outputAsset } = swapStore();

  const orderedChains = useMemo(() => {
    return chains
      ? Object.values(chains).sort((a, b) => {
          if (a.name.toLowerCase().includes("bitcoin")) return -1;
          if (b.name.toLowerCase().includes("bitcoin")) return 1;
          return 0;
        })
      : [];
  }, [chains]);

  const comparisonToken = useMemo(
    () =>
      isAssetSelectorOpen.type === IOType.input ? outputAsset : inputAsset,
    [isAssetSelectorOpen.type, inputAsset, outputAsset]
  );

  useEffect(() => {
    if (!assets || !strategies.val) return;
    if (!comparisonToken) {
      setResults(Object.values(assets));
    } else {
      const supportedTokens = Object.values(assets).filter((asset) => {
        const op =
          isAssetSelectorOpen.type === IOType.input
            ? constructOrderPair(
                asset.chain,
                asset.atomicSwapAddress,
                comparisonToken.chain,
                comparisonToken.atomicSwapAddress
              )
            : constructOrderPair(
                comparisonToken.chain,
                comparisonToken.atomicSwapAddress,
                asset.chain,
                asset.atomicSwapAddress
              );
        return strategies.val && strategies.val[op] !== undefined;
      });
      setResults(supportedTokens);
    }
  }, [assets, comparisonToken, isAssetSelectorOpen.type, strategies.val]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!assets) return;
    const input = e.target.value.toLowerCase();
    const filteredAssets = Object.values(assets).filter(
      (asset) =>
        asset.name?.toLowerCase().includes(input) ||
        asset.symbol?.toLowerCase().includes(input)
    );
    setInput(input);
    setResults(filteredAssets);
  };

  const handleClick = (asset?: Asset) => {
    if (asset) setAsset(isAssetSelectorOpen.type, asset);
    CloseAssetSelector();
    setTimeout(() => {
      setChain(undefined);
      setInput("");
    }, 700);
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 rounded-[20px] top-60 left-auto z-40 transition-left ease-cubic-in-out duration-700">
      <div className="flex justify-between items-center p-1">
        <Typography size="h4" weight="bold">
          Token select
        </Typography>
        <CloseIcon className="cursor-pointer" onClick={onClose} />
      </div>

      <div className="flex flex-wrap gap-3">
        {orderedChains
          .filter((c) => {
            const assetsForChain = results?.filter(
              (asset) => asset.chain === c.identifier
            );
            return assetsForChain && assetsForChain.length > 0;
          })
          .map((c, i) => (
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
      <div className="flex flex-col min-h-[288px] bg-white rounded-2xl h-full overflow-auto">
        <div className="px-4 pt-4 pb-1.5">
          <Typography size="h5" weight="bold">
            Assets
          </Typography>
        </div>
        {results?.map((asset) => {
          const network = !isBitcoin(asset.chain)
            ? chains?.[asset.chain]
            : undefined;
          return (
            (!chain || asset.chain === chain.identifier) && (
              <div
                key={`${asset.chain}-${asset.atomicSwapAddress}`}
                className="flex justify-between items-center px-4 py-1.5 cursor-pointer hover:bg-off-white w-full"
                onClick={() => handleClick(asset)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="w-10">
                    <AssetChainLogos
                      tokenLogo={asset.logo}
                      chainLogo={network?.networkLogo}
                    />
                  </div>
                  <Typography size="h4" weight="medium" className="w-1/6">
                    {asset.symbol}
                  </Typography>
                  <Typography
                    className="!text-mid-grey w-2/3 "
                    size={"h5"}
                    breakpoints={{
                      sm: "h4",
                    }}
                    weight="medium"
                  >
                    {asset.name}
                  </Typography>
                </div>
                <StarIcon className={`fill-light-grey`} />
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};

export default AssetSelector;
