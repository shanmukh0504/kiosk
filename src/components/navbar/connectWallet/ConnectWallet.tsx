import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { Connector } from "wagmi";
import {
  ArrowLeftIcon,
  Chip,
  CloseIcon,
  RadioCheckedIcon,
  Typography,
} from "@gardenfi/garden-book";
import { BlockchainType, Chain, is } from "@gardenfi/orderbook";
import {
  getAvailableWallets,
  getWalletConnectionStatus,
  Wallet,
} from "./getSupportedWallets";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { WalletRow } from "./WalletRow";
import { MultiWalletConnection } from "./MultiWalletConnection";
import { handleEVMConnect, handleStarknetConnect } from "./handleConnect";
import { modalStore } from "../../../store/modalStore";
import {
  BlockChainTypes,
  blockchainTypeToWalletProperty,
  ecosystems,
} from "./constants";
import { AnimatePresence } from "framer-motion";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";
import { ConnectingWalletStore } from "../../../store/connectWalletStore";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";
import { WalletWithRequiredFeatures as SuiWallet } from "@mysten/wallet-standard";
import { Wallet as TronWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { Connector as StarknetConnector } from "@starknet-react/core";
import { useSuiWallet } from "../../../hooks/useSuiWallet";
import { useTronWallet } from "../../../hooks/useTronWallet";
import { useXRPLWallet } from "../../../hooks/useXRPLWallet";
import { assetInfoStore } from "../../../store/assetInfoStore";

import logger from "../../../utils/logger";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};
export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onClose }) => {
  const [multiWalletConnector, setMultiWalletConnector] = useState<{
    [BlockchainType.evm]?: Connector | undefined;
    [BlockchainType.bitcoin]?: IInjectedBitcoinProvider;
    [BlockchainType.starknet]?: StarknetConnector | undefined;
    [BlockchainType.solana]?: SolanaWallet | undefined;
    [BlockchainType.sui]?: SuiWallet | undefined;
    [BlockchainType.tron]?: TronWallet | undefined;
  }>();
  const [selectedEcosystem, setSelectedEcosystem] =
    useState<BlockchainType | null>(null);

  const { connectors, connectAsync, connector } = useEVMWallet();
  const {
    starknetConnectors,
    starknetConnector,
    starknetStatus,
    starknetConnectAsync,
    starknetDisconnect,
    starknetSwitchChain,
  } = useStarknetWallet();
  const { availableWallets, connect, provider } = useBitcoinWallet();
  const {
    availableWallets: availableLitecoinWallets,
    connect: connectLitecoin,
    provider: litecoinProvider,
  } = useLitecoinWallet();
  const { connectingWallet, setConnectingWallet } = ConnectingWalletStore();
  const {
    solanaWallets,
    solanaConnect,
    solanaConnected,
    solanaDisconnect,
    solanaSelectedWallet,
  } = useSolanaWallet();
  const { suiConnected, suiSelectedWallet, suiWallets, handleSuiConnect } =
    useSuiWallet();
  const {
    wallets: tronWallets,
    handleTronConnect,
    tronConnected,
    wallet: tronSelectedWallet,
  } = useTronWallet();
  const { xrplAddress, xrplConnected, handleXRPLConnect } = useXRPLWallet();
  const { modalData } = modalStore();
  const { chains, isLoading: isLoadingChains } = assetInfoStore();

  const showOnlyBTCWallets = !!modalData.connectWallet?.bitcoin;
  const showOnlyStarknetWallets = !!modalData.connectWallet?.starknet;
  const showOnlyEVMWallets = !!modalData.connectWallet?.evm;
  const showOnlySolanaWallets = !!modalData.connectWallet?.solana;
  const showOnlySuiWallets = !!modalData.connectWallet?.sui;
  const showOnlyTronWallets = !!modalData.connectWallet?.tron;
  const showOnlyLitecoinWallets = !!modalData.connectWallet?.litecoin;
  const showOnlyXRPLWallets = !!modalData.connectWallet?.xrpl;

  const availableBlockchainTypes: Set<BlockchainType> = useMemo(() => {
    const availableTypes = new Set<BlockchainType>();
    if (chains) {
      const blockchainTypes = Object.keys(ecosystems) as BlockchainType[];
      Object.keys(chains).forEach((chainKey) => {
        blockchainTypes.forEach((blockchainType) => {
          if (is(blockchainType)(chainKey as Chain)) {
            availableTypes.add(blockchainType);
          }
        });
      });
    }

    return availableTypes;
  }, [chains]);

  useEffect(() => {
    const selected = showOnlyStarknetWallets
      ? BlockchainType.starknet
      : showOnlyEVMWallets
        ? BlockchainType.evm
        : showOnlyBTCWallets
          ? BlockchainType.bitcoin
          : showOnlySolanaWallets
            ? BlockchainType.solana
            : showOnlySuiWallets
              ? BlockchainType.sui
              : showOnlyTronWallets
                ? BlockchainType.tron
                : showOnlyLitecoinWallets
                  ? BlockchainType.litecoin
                  : showOnlyXRPLWallets
                    ? BlockchainType.xrpl
                    : null;

    if (selected) setSelectedEcosystem(selected);
  }, [
    showOnlyStarknetWallets,
    showOnlyEVMWallets,
    showOnlyBTCWallets,
    showOnlySolanaWallets,
    showOnlySuiWallets,
    showOnlyTronWallets,
    showOnlyLitecoinWallets,
    showOnlyXRPLWallets,
  ]);

  const allAvailableWallets = useMemo(() => {
    let allWallets = getAvailableWallets(
      availableWallets,
      availableLitecoinWallets,
      connectors,
      starknetConnectors,
      solanaWallets,
      suiWallets,
      tronWallets
    );

    allWallets = allWallets.filter((wallet) => {
      return Object.keys(ecosystems).some((blockchainType) => {
        const type = blockchainType as BlockChainTypes;
        if (!availableBlockchainTypes.has(type)) return false;
        return !!wallet[blockchainTypeToWalletProperty[type]];
      });
    });

    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isCoinbaseWallet
    ) {
      allWallets = allWallets.filter((wallet) => wallet.id !== "injected");
    }
    return allWallets;
  }, [
    availableBlockchainTypes,
    availableWallets,
    availableLitecoinWallets,
    connectors,
    starknetConnectors,
    solanaWallets,
    suiWallets,
    tronWallets,
  ]);

  const filteredWallets = useMemo(() => {
    if (!selectedEcosystem) return allAvailableWallets;

    const property =
      blockchainTypeToWalletProperty[selectedEcosystem as BlockChainTypes];
    if (!property) return allAvailableWallets;

    return allAvailableWallets.filter((wallet) => !!wallet[property]);
  }, [selectedEcosystem, allAvailableWallets]);

  const handleClose = useCallback(() => {
    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
  }, [setConnectingWallet]);

  const close = () => {
    onClose?.();
    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
  };

  const handleConnect = async (connector: Wallet) => {
    if (!connector.isAvailable) {
      window.open(connector.installLink, "_blank");
      return;
    }
    setConnectingWallet(connector.id);
    try {
      const isMultiChain = [
        connector.isBitcoin && connector.isEVM,
        connector.isBitcoin && connector.isStarknet,
        connector.isEVM && connector.isSolana,
        connector.isBitcoin && connector.isSolana,
        connector.isStarknet && connector.isSolana,
        connector.isStarknet && connector.isEVM,
        connector.isSui && connector.isEVM,
        connector.isSui && connector.isSolana,
        connector.isSui && connector.isStarknet,
        connector.isSui && connector.isBitcoin,
        connector.isTron && connector.isEVM,
        connector.isTron && connector.isSolana,
        connector.isTron && connector.isStarknet,
        connector.isTron && connector.isSui,
        connector.isTron && connector.isBitcoin,
      ].some(Boolean);

      if (isMultiChain) {
        const walletTypes = [
          connector.wallet?.evmWallet,
          connector.wallet?.btcWallet,
          connector.wallet?.starknetWallet,
          connector.wallet?.solanaWallet,
          connector.wallet?.suiWallet,
          connector.wallet?.tronWallet,
        ].filter(Boolean);

        if (walletTypes.length < 2) return;

        setMultiWalletConnector({
          [BlockchainType.evm]: connector.wallet.evmWallet,
          [BlockchainType.bitcoin]: connector.wallet.btcWallet,
          [BlockchainType.starknet]: connector.wallet.starknetWallet,
          [BlockchainType.solana]: connector.wallet.solanaWallet,
          [BlockchainType.sui]: connector.wallet.suiWallet,
          [BlockchainType.tron]: connector.wallet.tronWallet,
          // [BlockchainType.xrpl]: undefined,
        });
        return;
      }

      if (connector.isSolana && connector.isEVM && connector.isSui) {
        if (!connector.wallet?.evmWallet || !connector.wallet?.solanaWallet)
          return;
        setMultiWalletConnector({
          evm: connector.wallet.evmWallet,
          solana: connector.wallet.solanaWallet,
          sui: connector.wallet.suiWallet,
          tron: connector.wallet.tronWallet,
        });
        return;
      }

      if (connector.isBitcoin) {
        if (!connector.wallet?.btcWallet) return;
        const res = await connect(connector.wallet.btcWallet);
        if (res.error) {
          logger.error("error connecting wallet", res.error);
        }
      } else if (connector.isLitecoin) {
        if (!connector.wallet?.litecoinWallet) return;
        const res = await connectLitecoin(connector.wallet.litecoinWallet);
        if (res.error) {
          logger.error("error connecting wallet", res.error);
        }
      } else if (connector.isEVM) {
        if (!connector.wallet?.evmWallet) return;

        await handleEVMConnect(connector.wallet.evmWallet, connectAsync);
        setConnectingWallet(null);
      } else if (connector.isStarknet) {
        if (!connector.wallet?.starknetWallet) return;
        await handleStarknetConnect(
          connector.wallet.starknetWallet,
          starknetConnectAsync,
          starknetSwitchChain,
          starknetDisconnect
        );
        setConnectingWallet(null);
      } else if (connector.isSolana) {
        if (!connector.wallet?.solanaWallet) return;
        const success = await solanaConnect(
          connector.wallet.solanaWallet.adapter.name
        );
        if (!success) throw new Error("Solana connection failed");
      } else if (connector.isSui) {
        if (!connector.wallet?.suiWallet) return;
        await handleSuiConnect(connector.wallet.suiWallet);
        setConnectingWallet(null);
      } else if (connector.isTron) {
        if (!connector.wallet?.tronWallet) return;
        await handleTronConnect(connector.wallet.tronWallet);
        setConnectingWallet(null);
      } else if (connector.isXRPL) {
        await handleXRPLConnect();
        setConnectingWallet(null);
      }
    } catch (error) {
      logger.error("Error connecting wallet:", error);
      await solanaDisconnect();
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <div className="flex max-h-[600px] flex-col gap-[20px] p-3">
      <div
        className="flex items-center justify-between"
        data-testid="connect-wallet-header"
      >
        <Typography
          size="h4"
          weight="medium"
          data-testid="connect-wallet-title"
        >
          Connect a Wallet
        </Typography>
        <div className="flex gap-4" data-testid="connect-wallet-actions">
          {multiWalletConnector && (
            <ArrowLeftIcon
              className="h-[14px] w-6 cursor-pointer"
              data-testid="connect-wallet-back"
              onClick={handleClose}
            />
          )}
          <CloseIcon
            className="hidden h-[14px] w-6 cursor-pointer sm:visible sm:block"
            data-testid="connect-wallet-close"
            onClick={close}
          />
        </div>
      </div>

      {!multiWalletConnector && (
        <div className="flex flex-wrap gap-3">
          {isLoadingChains ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 animate-pulse rounded-full bg-gray-200"
                />
              ))}
            </>
          ) : (
            <>
              {Object.entries(ecosystems)
                .filter(([key]) => {
                  const type = key as BlockChainTypes;
                  if (!availableBlockchainTypes.has(type)) return false;
                  return allAvailableWallets.some(
                    (w) => !!w[blockchainTypeToWalletProperty[type]]
                  );
                })
                .map(([key, ecosystem]) => (
                  <Chip
                    key={key}
                    className={`cursor-pointer !bg-opacity-50 py-1.5 pl-3 pr-1 capitalize transition-colors ease-cubic-in-out hover:!bg-opacity-100`}
                    onClick={() => {
                      setSelectedEcosystem((prev) =>
                        prev === key ? null : (key as BlockchainType)
                      );
                    }}
                  >
                    <Typography size="h3" weight="regular">
                      {ecosystem.name === "EVM" ? "EVM" : ecosystem.name}
                    </Typography>
                    <RadioCheckedIcon
                      className={`${
                        selectedEcosystem === key ? "mr-1 w-4" : "w-0"
                      } fill-rose transition-all`}
                    />
                  </Chip>
                ))}
            </>
          )}
        </div>
      )}

      {multiWalletConnector ? (
        <MultiWalletConnection
          availableBlockchainTypes={availableBlockchainTypes}
          connectors={multiWalletConnector}
          handleClose={handleClose}
        />
      ) : (
        <div
          className={`scrollbar-hide flex flex-col gap-1 rounded-2xl bg-white/50 p-4 transition-all duration-300 ${isLoadingChains ? "overflow-hidden overscroll-none" : "overflow-y-auto overscroll-contain"}`}
          data-testid="connect-wallet-list"
        >
          {filteredWallets.length > 0 ? (
            <AnimatePresence>
              {filteredWallets.map((wallet, index) => (
                <WalletRow
                  key={wallet.id}
                  name={wallet.name}
                  logo={wallet.logo}
                  onClick={async () => {
                    await handleConnect(wallet);
                  }}
                  isConnecting={connectingWallet === wallet.id.toLowerCase()}
                  isConnected={getWalletConnectionStatus(wallet, {
                    btcProvider: provider,
                    litecoinProvider: litecoinProvider,
                    evmConnector: connector,
                    starknetConnector,
                    starknetStatus,
                    solanaConnected,
                    solanaSelectedWallet,
                    suiConnected,
                    suiSelectedWallet,
                    tronConnected,
                    tronSelectedWallet,
                    xrplConnected,
                    xrplAddress,
                  })}
                  isAvailable={wallet.isAvailable}
                  isLoadingChains={isLoadingChains}
                  index={index}
                />
              ))}
            </AnimatePresence>
          ) : (
            <Typography size="h3" data-testid="connect-wallet-not-found">
              No wallets found
            </Typography>
          )}
        </div>
      )}

      <div className="mb-2">
        <Typography size="h4" weight="regular">
          By connecting a wallet, you agree to Garden&apos;s{" "}
          <a
            href="https://garden.finance/terms.pdf"
            target="_blank"
            rel="noreferrer"
            className="font-bold"
          >
            Terms of Service{" "}
          </a>
          and{" "}
          <a
            href="https://garden.finance/privacy.pdf"
            target="_blank"
            rel="noreferrer"
            className="font-bold"
          >
            Privacy Policy
          </a>
          .
        </Typography>
      </div>
    </div>
  );
};
