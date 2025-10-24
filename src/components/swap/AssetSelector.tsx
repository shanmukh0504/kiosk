import {
  CloseIcon,
  GradientScroll,
  SearchIcon,
  TokenNetworkLogos,
  Typography,
} from "@gardenfi/garden-book";
import BigNumber from "bignumber.js";
import { FC, useState, ChangeEvent, useEffect, useMemo, useRef } from "react";
import {
  isStarknet,
  isSolana,
  isSui,
  Asset,
  ChainAsset,
} from "@gardenfi/orderbook";
import { assetInfoStore, ChainData } from "../../store/assetInfoStore";
import { BTC, swapStore } from "../../store/swapStore";
import { IOType, network } from "../../constants/constants";
import { modalStore } from "../../store/modalStore";
import { ChainsTooltip } from "./ChainsTooltip";
import { AvailableChainsSidebar } from "./AvailableChainsSidebar";
import { AnimatePresence, motion } from "framer-motion";
import { formatAmount } from "../../utils/utils";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { viewPortStore } from "../../store/viewPortStore";
import { Network } from "@gardenfi/utils";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { useSuiWallet } from "../../hooks/useSuiWallet";
import { balanceStore } from "../../store/balanceStore";

type props = {
  onClose: () => void;
};

export const AssetSelector: FC<props> = ({ onClose }) => {
  const [chain, setChain] = useState<ChainData>();
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<Asset[]>();
  const [searchResults, setSearchResults] = useState<Asset[]>();
  const [hoveredChain, setHoveredChain] = useState("");
  const [showAllChains, setShowAllChains] = useState(false);
  const [visibleChainsCount, setVisibleChainsCount] = useState<number>(7);
  const [sidebarSelectedChain, setSidebarSelectedChain] = useState<
    ChainData | undefined
  >();
  const inputRef = useRef<HTMLInputElement>(null);
  const { address } = useEVMWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { starknetAccount } = useStarknetWallet();
  const { solanaAddress } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();
  const { isMobile } = viewPortStore();

  const {
    isAssetSelectorOpen,
    CloseAssetSelector,
    assets,
    chains,
    fiatData,
    isRouteValid,
    getValidDestinations,
  } = assetInfoStore();
  const { balances } = balanceStore();
  const { modalName } = modalStore();
  const { setAsset, inputAsset, outputAsset } = swapStore();

  const orderedChains = useMemo(() => {
    // TODO: remove hyperevm once we have a proper types (hyperliquid is not in the types)
    const order: string[] = [
      "bitcoin",
      "ethereum",
      "solana",
      "base",
      "arbitrum",
      "starknet",
      "hyperevm",
    ];

    if (!chains) return [];

    const sortedChainsByOrder = Object.values(chains).sort((a, b) => {
      const indexA = order.findIndex((name) =>
        a.name.toLowerCase().includes(name)
      );
      const indexB = order.findIndex((name) =>
        b.name.toLowerCase().includes(name)
      );
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sortedChainsByOrder;
  }, [chains]);

  const comparisonToken = useMemo(
    () =>
      isAssetSelectorOpen.type === IOType.input ? outputAsset : inputAsset,
    [isAssetSelectorOpen.type, inputAsset, outputAsset]
  );

  const sortedResults = useMemo(() => {
    const assetsToSort = input ? searchResults : results;
    if (!assetsToSort && orderedChains.length === 0) return [];

    // Get valid destinations if we're selecting output and have an input asset
    let validDestinations: Asset[] = [];
    if (isAssetSelectorOpen.type === IOType.output && inputAsset) {
      validDestinations = getValidDestinations(inputAsset);
    }

    return (
      assetsToSort &&
      assetsToSort
        .sort((a, b) => {
          const chainA = chains?.[a.chain];
          const chainB = chains?.[b.chain];
          if (chainA && chainB) {
            const indexA = orderedChains.findIndex(
              (c) => c.chain === chainA.chain
            );
            const indexB = orderedChains.findIndex(
              (c) => c.chain === chainB.chain
            );
            return indexA - indexB;
          }
          return 0;
        })
        .filter((asset) => !chain || asset.chain === chain.chain)
        .filter((asset) => {
          // If we're selecting output and have an input asset, use route validator
          if (isAssetSelectorOpen.type === IOType.output && inputAsset) {
            // Check if this asset is in the valid destinations
            return validDestinations.some(
              (validAsset) =>
                validAsset.chain === asset.chain &&
                validAsset.htlc?.address === asset.htlc?.address &&
                validAsset.token?.address === asset.token?.address
            );
          }
          return true;
        })
        .map((asset) => {
          const network = chains?.[asset.chain];
          const balance = balances?.[asset.id.toString()];
          if (!asset.id) return undefined;
          const fiatRate =
            fiatData?.[ChainAsset.from(asset.id).toString()] ?? 0;
          const formattedBalance =
            balance && asset && balance.toNumber() === 0
              ? ""
              : balance &&
                  !isStarknet(asset.chain) &&
                  !isSolana(asset.chain) &&
                  !isSui(asset.chain)
                ? new BigNumber(balance)
                    .dividedBy(10 ** asset.decimals)
                    .toNumber()
                : balance?.toNumber();
          const fiatBalance =
            formattedBalance &&
            (Number(formattedBalance) * Number(fiatRate)).toFixed(5);

          return {
            asset,
            network,
            formattedBalance,
            fiatBalance,
          };
        })
    );
  }, [
    searchResults,
    getValidDestinations,
    inputAsset,
    results,
    orderedChains,
    chains,
    chain,
    balances,
    fiatData,
    input,
    isAssetSelectorOpen.type,
  ]);

  const isAnyWalletConnected =
    !!address ||
    !!btcAddress ||
    !!starknetAccount ||
    !!solanaAddress ||
    !!currentAccount;

  const fiatBasedSortedResults = useMemo(() => {
    if (!isAnyWalletConnected) return sortedResults;
    return (
      sortedResults &&
      [...sortedResults].sort((a, b) => {
        if (!a || !b) return 0;
        const aFiat = a.fiatBalance ? Number(a.fiatBalance) : 0;
        const bFiat = b.fiatBalance ? Number(b.fiatBalance) : 0;
        return bFiat - aFiat;
      })
    );
  }, [sortedResults, isAnyWalletConnected]);

  const visibleChains = useMemo(() => {
    if (!sidebarSelectedChain)
      return orderedChains.slice(0, visibleChainsCount);
    const selectedIdx = orderedChains.findIndex(
      (c) => c.chain === sidebarSelectedChain.chain
    );
    if (selectedIdx < visibleChainsCount && selectedIdx !== -1) {
      return orderedChains.slice(0, visibleChainsCount);
    }
    return [
      ...orderedChains.slice(0, visibleChainsCount - 1),
      orderedChains[selectedIdx],
    ];
  }, [visibleChainsCount, orderedChains, sidebarSelectedChain]);

  const handleClick = async (asset?: Asset) => {
    if (asset) {
      const isMatchingToken =
        asset.chain === comparisonToken?.chain &&
        asset.htlc?.address === comparisonToken?.htlc?.address;
      // If selecting input and current output is invalid for the new input, clear output first
      const isValid = outputAsset && (await isRouteValid(asset, outputAsset));
      if (isAssetSelectorOpen.type === IOType.input && !isValid)
        setAsset(IOType.output, undefined);
      setAsset(isAssetSelectorOpen.type, asset);
      if (isMatchingToken) {
        setAsset(
          isAssetSelectorOpen.type === IOType.input
            ? IOType.output
            : IOType.input,
          isAssetSelectorOpen.type === IOType.input ? inputAsset : outputAsset
        );
      }
    }
    CloseAssetSelector();
    setTimeout(() => {
      setChain(undefined);
      setInput("");
    }, 700);
    onClose();
  };

  const hideSidebar = () => setShowAllChains(false);

  const handleChainClick = (selectedChain: ChainData) => {
    setChain(selectedChain);
    setSidebarSelectedChain(selectedChain);
    setShowAllChains(false);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!results) return;
    const inputValue = e.target.value.toLowerCase();
    setInput(inputValue);

    if (!inputValue) {
      setSearchResults(undefined);
      return;
    }
    setSearchResults(
      results.filter(
        (asset) =>
          asset.name?.toLowerCase().includes(inputValue) ||
          asset.symbol?.toLowerCase().includes(inputValue) ||
          asset.chain?.toLowerCase().includes(inputValue)
      )
    );
  };

  useEffect(() => {
    if (!assets) return;
    setResults(Object.values(assets));
  }, [assets]);

  useEffect(() => {
    setVisibleChainsCount(isMobile ? 5 : 7);
  }, [isMobile]);

  useEffect(() => {
    if (!modalName.assetList) {
      setShowAllChains(false);
      CloseAssetSelector();
    }
  }, [CloseAssetSelector, modalName.assetList]);

  return (
    <>
      <AvailableChainsSidebar
        show={showAllChains}
        chains={[...orderedChains]}
        hide={hideSidebar}
        onClick={handleChainClick}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key="mainAssetSelector"
          initial={{ opacity: 1 }}
          animate={{ opacity: showAllChains ? 0 : 1 }}
          // exit={{ opacity: 1 }}
          transition={{
            duration: showAllChains ? 0.32 : 0.45,
            delay: showAllChains ? 0 : 0.25,
            ease: "easeOut",
          }}
          className={`left-auto top-60 z-30 flex flex-col gap-3 rounded-[20px] sm:min-w-[468px] ${isMobile ? "" : "m-1"}`}
        >
          <div className="flex items-center justify-between p-1">
            <Typography size="h4" weight="medium">
              {`Select token to ${
                isAssetSelectorOpen.type === IOType.input ? "send" : "receive"
              }`}
            </Typography>
            <CloseIcon
              className="hidden cursor-pointer sm:visible sm:block"
              onClick={onClose}
            />
          </div>
          <div className="flex w-full flex-wrap gap-3">
            <div className={`flex w-full ${isMobile ? "gap-2" : "gap-3"}`}>
              {visibleChains.map((c, i) => {
                return (
                  <button
                    key={i}
                    className={`relative flex h-12 flex-1 items-center justify-center gap-2 overflow-visible rounded-xl outline-none duration-300 ease-in-out ${
                      !chain || c.id !== chain.id ? "bg-white/50" : "bg-white"
                    }`}
                    onMouseEnter={() => setHoveredChain(c.name)}
                    onMouseLeave={() => setHoveredChain("")}
                    onClick={() =>
                      c === chain ? setChain(undefined) : setChain(c)
                    }
                  >
                    <img
                      src={c.icon}
                      alt={c.name}
                      className={`h-full max-h-5 w-full max-w-5 rounded-full`}
                    />
                    {hoveredChain === c.name && (
                      <ChainsTooltip
                        chain={c.name}
                        className={`${network === Network.TESTNET ? (i === 0 ? "translate-x-7" : orderedChains.length - visibleChainsCount === 0 && i === visibleChainsCount - 1 && !!isMobile ? "-translate-x-4" : "") : ""}`}
                      />
                    )}
                  </button>
                );
              })}
              {orderedChains.length > visibleChainsCount && (
                <button
                  className={`h-12 w-12 cursor-pointer rounded-xl bg-white/50 p-4 duration-300 ease-in-out`}
                  onClick={() => setShowAllChains(true)}
                >
                  <Typography
                    size="h4"
                    weight="regular"
                    className="!flex !cursor-pointer !items-center !text-mid-grey"
                  >
                    +{orderedChains.length - visibleChainsCount}
                  </Typography>
                </button>
              )}
            </div>
          </div>
          <div className="flex w-full items-center justify-between rounded-2xl bg-white/50 px-4 py-[10px]">
            <div className="flex flex-grow items-center">
              <Typography size="h4" weight="regular" className="gf-w-full">
                <input
                  ref={inputRef}
                  className="w-full bg-transparent outline-none placeholder:text-mid-grey focus:outline-none"
                  type="text"
                  value={input}
                  placeholder="Search assets or chains"
                  onChange={handleSearch}
                />
              </Typography>
            </div>
            <SearchIcon />
          </div>
          <div className="flex h-[316px] flex-col overflow-auto rounded-2xl bg-white">
            <div className="px-4 pb-2 pt-2">
              <Typography size="h5" weight="medium">
                {chain ? "Assets on " + chain.name : "Assets"}
              </Typography>
            </div>
            <GradientScroll
              height={272}
              gradientHeight={42}
              onClose={!modalName.assetList}
            >
              {fiatBasedSortedResults && fiatBasedSortedResults.length > 0 ? (
                fiatBasedSortedResults
                  .filter((result) => result !== undefined)
                  .map(({ asset, network, formattedBalance }, index) => {
                    return (
                      <div
                        key={`${asset?.chain}-${asset?.htlc?.address}-${asset?.token?.address || "native"}-${index}`}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-1.5 hover:bg-off-white"
                        onClick={() => handleClick(asset)}
                      >
                        <div className="flex w-full items-center gap-2">
                          <div className={`w-10`}>
                            <TokenNetworkLogos
                              tokenLogo={asset.icon}
                              chainLogo={network?.icon}
                            />
                          </div>
                          <Typography
                            className={`w-2/3`}
                            size={"h5"}
                            breakpoints={{ sm: "h4" }}
                            weight="regular"
                          >
                            {asset.name}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-1">
                          {formattedBalance && (
                            <Typography
                              size={"h5"}
                              breakpoints={{
                                sm: "h4",
                              }}
                              weight="regular"
                              className={`!text-mid-grey`}
                            >
                              {formatAmount(
                                Number(formattedBalance),
                                0,
                                Math.min(asset.decimals, BTC.decimals)
                              )}
                            </Typography>
                          )}
                          <Typography
                            size={"h5"}
                            breakpoints={{
                              sm: "h4",
                            }}
                            weight="regular"
                            className={`!text-mid-grey`}
                          >
                            {asset.symbol}
                          </Typography>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="flex min-h-[274px] w-full items-center justify-center">
                  <Typography size="h4" weight="regular">
                    No assets found.
                  </Typography>
                </div>
              )}
            </GradientScroll>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
