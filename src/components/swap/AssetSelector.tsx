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
    const order = ["bitcoin", "ethereum", "base", "arbitrum"];
    return chains
      ? Object.values(chains).sort((a, b) => {
          const indexA = order.findIndex((name) =>
            a.name.toLowerCase().includes(name)
          );
          const indexB = order.findIndex((name) =>
            b.name.toLowerCase().includes(name)
          );
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
      : [];
  }, [chains]);

  const sortedResults = useMemo(() => {
    if (results && orderedChains.length > 0) {
      return [...results].sort((a, b) => {
        const chainA = chains?.[a.chain];
        const chainB = chains?.[b.chain];
        if (chainA && chainB) {
          const indexA = orderedChains.findIndex(
            (c) => c.identifier === chainA.identifier
          );
          const indexB = orderedChains.findIndex(
            (c) => c.identifier === chainB.identifier
          );
          return indexA - indexB;
        }
        return 0;
      });
    }
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, orderedChains]);

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
    <div className="transition-left left-auto top-60 z-40 flex flex-col gap-3 rounded-[20px] duration-700 ease-cubic-in-out">
      <div className="flex items-center justify-between p-1">
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
              } cursor-pointer py-1 pl-3 transition-colors ease-cubic-in-out hover:bg-opacity-50`}
              onClick={() => (c === chain ? setChain(undefined) : setChain(c))}
            >
              <Typography size="h3" weight="medium">
                {c.name}
              </Typography>
              <RadioCheckedIcon
                className={`${
                  c === chain ? "w-4" : "w-0"
                } fill-rose transition-all`}
              />
            </Chip>
          ))}
      </div>
      <div className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-2">
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
      <div className="flex h-full min-h-[288px] flex-col overflow-auto rounded-2xl bg-white">
        <div className="px-4 pb-1.5 pt-4">
          <Typography size="h5" weight="bold">
            Assets
          </Typography>
        </div>
        {sortedResults?.map((asset) => {
          const network = !isBitcoin(asset.chain)
            ? chains?.[asset.chain]
            : undefined;
          return (
            (!chain || asset.chain === chain.identifier) && (
              <div
                key={`${asset.chain}-${asset.atomicSwapAddress}`}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-1.5 hover:bg-off-white"
                onClick={() => handleClick(asset)}
              >
                <div className="flex w-full items-center gap-2">
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
                    className="w-2/3 !text-mid-grey"
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
