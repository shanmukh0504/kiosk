import {
  CloseIcon,
  GradientScroll,
  SearchIcon,
  Typography,
} from "@gardenfi/garden-book";
import BigNumber from "bignumber.js";
import { FC, useState, ChangeEvent, useEffect, useMemo, useRef } from "react";
import {
  Asset,
  isBitcoin,
  isStarknet,
  isSolana,
  isSolanaNativeToken,
  isEvmNativeToken,
} from "@gardenfi/orderbook";
import { assetInfoStore, ChainData } from "../../store/assetInfoStore";
import { BTC, swapStore } from "../../store/swapStore";
import {
  IOType,
  network,
  PHANTOM_SUPPORTED_CHAINS,
} from "../../constants/constants";
import { constructOrderPair } from "@gardenfi/core";
import { AssetChainLogos } from "../../common/AssetChainLogos";
import { modalStore } from "../../store/modalStore";
import { ChainsTooltip } from "./ChainsTooltip";
import { AvailableChainsSidebar } from "./AvailableChainsSidebar";
import { AnimatePresence, motion } from "framer-motion";
import {
  formatAmount,
  getAssetChainHTLCAddressPair,
  getOrderPair,
} from "../../utils/utils";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { viewPortStore } from "../../store/viewPortStore";
import { Network } from "@gardenfi/utils";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";

type props = {
  onClose: () => void;
};

export const AssetSelector: FC<props> = ({ onClose }) => {
  const [chain, setChain] = useState<ChainData>();
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<Asset[]>();
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
  const { isMobile } = viewPortStore();
  const { connector } = useEVMWallet();

  const {
    isAssetSelectorOpen,
    CloseAssetSelector,
    assets,
    chains,
    strategies,
    balances,
    fiatData,
  } = assetInfoStore();
  const { modalName } = modalStore();
  const { setAsset, inputAsset, outputAsset, clearSwapInputState } =
    swapStore();

  const phantomEvmConnected = !!(connector && connector.id === "app.phantom");

  const orderedChains = useMemo(() => {
    const order = ["bitcoin", "ethereum", "base", "arbitrum"];

    if (!chains) return [];

    // Sort chains based on the predefined order
    const sortedChains = Object.values(chains).sort((a, b) => {
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

    if (phantomEvmConnected) {
      return sortedChains.sort((a, b) => {
        const isChainASupported = PHANTOM_SUPPORTED_CHAINS.includes(
          a.identifier
        );
        const isChainBSupported = PHANTOM_SUPPORTED_CHAINS.includes(
          b.identifier
        );

        if (isChainASupported !== isChainBSupported) {
          return isChainASupported ? -1 : 1;
        }
        return 0;
      });
    }

    return sortedChains;
  }, [chains, phantomEvmConnected]);

  const comparisonToken = useMemo(
    () =>
      isAssetSelectorOpen.type === IOType.input ? outputAsset : inputAsset,
    [isAssetSelectorOpen.type, inputAsset, outputAsset]
  );

  const sortedResults = useMemo(() => {
    if (!results && orderedChains.length === 0) return [];
    return (
      results &&
      [...results]
        .sort((a, b) => {
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
        })
        .filter((asset) => !chain || asset.chain === chain.identifier)
        .map((asset) => {
          const network =
            !isBitcoin(asset.chain) &&
            !isEvmNativeToken(asset.chain, asset.tokenAddress) &&
            !isSolanaNativeToken(asset.chain, asset.tokenAddress)
              ? chains?.[asset.chain]
              : undefined;
          const orderPair = getOrderPair(asset.chain, asset.tokenAddress);
          const balance = balances?.[orderPair];
          const fiatRate = fiatData?.[getAssetChainHTLCAddressPair(asset)] ?? 0;
          const formattedBalance =
            balance && asset && balance.toNumber() === 0
              ? ""
              : balance && !isStarknet(asset.chain) && !isSolana(asset.chain)
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
  }, [results, orderedChains, chains, chain, balances, fiatData]);

  const isAnyWalletConnected =
    !!address || !!btcAddress || !!starknetAccount || !!solanaAddress;
  const fiatBasedSortedResults = useMemo(() => {
    if (!isAnyWalletConnected) return sortedResults;

    return (
      sortedResults &&
      [...sortedResults].sort((a, b) => {
        const aFiat = Number(a.fiatBalance) || 0;
        const bFiat = Number(b.fiatBalance) || 0;
        return bFiat - aFiat;
      })
    );
  }, [sortedResults, isAnyWalletConnected]);

  const visibleChains = useMemo(() => {
    if (!sidebarSelectedChain)
      return orderedChains.slice(0, visibleChainsCount);
    const selectedIdx = orderedChains.findIndex(
      (c) => c.identifier === sidebarSelectedChain.identifier
    );
    if (selectedIdx < visibleChainsCount && selectedIdx !== -1) {
      return orderedChains.slice(0, visibleChainsCount);
    }
    return [
      ...orderedChains.slice(0, visibleChainsCount - 1),
      orderedChains[selectedIdx],
    ];
  }, [visibleChainsCount, orderedChains, sidebarSelectedChain]);

  const handleClick = (asset?: Asset) => {
    if (asset) {
      const isMatchingToken =
        asset.chain === comparisonToken?.chain &&
        asset.atomicSwapAddress === comparisonToken?.atomicSwapAddress;
      setAsset(isAssetSelectorOpen.type, asset);
      if (isMatchingToken) {
        setAsset(
          isAssetSelectorOpen.type === IOType.input
            ? IOType.output
            : IOType.input,
          isAssetSelectorOpen.type === IOType.input ? inputAsset : outputAsset
        );
      }
      // if input asset is selected, check if the output asset is supported
      if (
        isAssetSelectorOpen.type === IOType.input &&
        outputAsset &&
        strategies.val
      ) {
        const op = constructOrderPair(
          asset.chain,
          asset.atomicSwapAddress,
          outputAsset.chain,
          outputAsset.atomicSwapAddress
        );
        if (!strategies.val[op]) {
          setAsset(IOType.output, undefined);
          clearSwapInputState();
        }
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
    const isChainSupportedByPhantom = PHANTOM_SUPPORTED_CHAINS.includes(
      selectedChain.identifier
    );
    if (phantomEvmConnected && !isChainSupportedByPhantom) {
      setSidebarSelectedChain(selectedChain);
      setShowAllChains(false);
      return;
    }
    setChain(selectedChain);
    setShowAllChains(false);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!assets) return;
    const inputValue = e.target.value.toLowerCase();
    setInput(inputValue);
    setResults(
      Object.values(assets).filter(
        (asset) =>
          asset.name?.toLowerCase().includes(inputValue) ||
          asset.symbol?.toLowerCase().includes(inputValue)
      )
    );
  };

  useEffect(() => {
    if (!assets || !strategies.val) return;
    if (!comparisonToken || isAssetSelectorOpen.type === IOType.input) {
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
      setResults([...supportedTokens, comparisonToken]);
    }
  }, [assets, comparisonToken, isAssetSelectorOpen.type, strategies.val]);

  useEffect(() => {
    setVisibleChainsCount(isMobile ? 5 : 7);
  }, [isMobile]);

  return (
    <>
      <AvailableChainsSidebar
        show={showAllChains}
        chains={orderedChains}
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
            <Typography size="h4" weight="bold">
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
                const isChainSupportedByPhantom =
                  PHANTOM_SUPPORTED_CHAINS.includes(c.identifier);
                const isDisabled =
                  phantomEvmConnected && !isChainSupportedByPhantom;

                return (
                  <button
                    key={i}
                    className={`relative flex h-12 flex-1 items-center justify-center gap-2 overflow-visible rounded-xl outline-none duration-300 ease-in-out ${
                      !chain || c.chainId !== chain.chainId
                        ? isDisabled
                          ? "!cursor-not-allowed bg-white/20"
                          : "bg-white/50"
                        : "bg-white"
                    }`}
                    onMouseEnter={() => setHoveredChain(c.name)}
                    onMouseLeave={() => setHoveredChain("")}
                    onClick={() => {
                      if (!isDisabled && c === chain) setChain(undefined);
                      else setChain(c);
                    }}
                    disabled={isDisabled}
                  >
                    <img
                      src={c.networkLogo}
                      alt={c.name}
                      className={`h-full max-h-5 w-full max-w-5 rounded-full ${isDisabled ? "opacity-50" : ""}`}
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
                    weight="medium"
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
              <Typography size="h4" weight="medium" className="gf-w-full">
                <input
                  ref={inputRef}
                  className="w-full bg-transparent outline-none placeholder:text-mid-grey focus:outline-none"
                  type="text"
                  value={input}
                  placeholder="Search assets"
                  onChange={handleSearch}
                />
              </Typography>
            </div>
            <SearchIcon />
          </div>
          <div className="flex h-[316px] flex-col overflow-auto rounded-2xl bg-white">
            <div className="px-4 pb-1.5 pt-3">
              <Typography size="h5" weight="bold">
                {chain ? "Assets on " + chain.name : "Assets"}
              </Typography>
            </div>
            <GradientScroll height={272} onClose={!modalName.assetList}>
              {fiatBasedSortedResults && fiatBasedSortedResults.length > 0 ? (
                fiatBasedSortedResults?.map(
                  ({ asset, network, formattedBalance }) => {
                    const isChainSupportedByPhantom =
                      PHANTOM_SUPPORTED_CHAINS.includes(asset.chain);
                    const isDisabled =
                      phantomEvmConnected && !isChainSupportedByPhantom;

                    return (
                      <div
                        key={`${asset.chain}-${asset.atomicSwapAddress}`}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-1.5 hover:bg-off-white"
                        onClick={() => {
                          if (!isDisabled) handleClick(asset);
                        }}
                      >
                        <div className="flex w-full items-center gap-2">
                          <div
                            className={`w-10 ${isDisabled ? "opacity-50" : ""}`}
                          >
                            <AssetChainLogos
                              tokenLogo={asset.logo}
                              chainLogo={network?.networkLogo}
                            />
                          </div>
                          <Typography
                            className={`w-2/3 ${isDisabled ? "opacity-50" : ""}`}
                            size={"h5"}
                            breakpoints={{ sm: "h4" }}
                            weight="medium"
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
                              weight="medium"
                              className={`!text-mid-grey ${isDisabled ? "opacity-50" : ""}`}
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
                            weight="medium"
                            className={`!text-mid-grey ${isDisabled ? "opacity-50" : ""}`}
                          >
                            {asset.symbol}
                          </Typography>
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="flex min-h-[274px] w-full items-center justify-center">
                  <Typography size="h4" weight="medium">
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
