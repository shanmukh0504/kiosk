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
import { getAvailableWallets, Wallet } from "./getSupportedWallets";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { WalletRow } from "./WalletRow";
import { MultiWalletConnection } from "./MultiWalletConnection";
import { handleEVMConnect } from "./handleConnect";
import { modalNames, modalStore } from "../../../store/modalStore";
import { ecosystems, evmToBTCid } from "./constants";
import { AnimatePresence } from "framer-motion";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";
import { ConnectingWalletStore } from "../../../store/connectWalletStore";
import { BlockchainType } from "@gardenfi/orderbook";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onClose }) => {
  const [multiWalletConnector, setMultiWalletConnector] = useState<{
    evm: Connector;
    btc: IInjectedBitcoinProvider;
  }>();
  const [selectedEcosystem, setSelectedEcosystem] =
    useState<BlockchainType | null>(null);

  const { connectors, connectAsync, connector, address } = useEVMWallet();
  const {
    starknetConnectors,
    starknetConnector,
    starknetStatus,
    starknetConnectAsync,
  } = useStarknetWallet();
  const { availableWallets, connect, provider } = useBitcoinWallet();
  const { connectingWallet, setConnectingWallet } = ConnectingWalletStore();
  const { modalData, setOpenModal } = modalStore();
  const showOnlyBTCWallets = !!modalData.connectWallet?.Bitcoin;
  const showOnlyStarknetWallets = !!modalData.connectWallet?.Starknet;
  const showOnlyEVMWallets = !!modalData.connectWallet?.EVM;

  // Add useEffect to handle initial ecosystem selection
  useEffect(() => {
    if (showOnlyStarknetWallets) {
      setSelectedEcosystem(BlockchainType.Starknet);
    } else if (showOnlyEVMWallets) {
      setSelectedEcosystem(BlockchainType.EVM);
    } else if (showOnlyBTCWallets) {
      setSelectedEcosystem(BlockchainType.Bitcoin);
    }
  }, [showOnlyStarknetWallets, showOnlyEVMWallets, showOnlyBTCWallets]);

  const allAvailableWallets = useMemo(() => {
    let allWallets;
    allWallets = getAvailableWallets(
      availableWallets,
      connectors,
      starknetConnectors
    );

    if (selectedEcosystem === BlockchainType.Bitcoin)
      return allWallets.filter((wallet) => wallet.isBitcoin);
    else if (selectedEcosystem === BlockchainType.EVM)
      return allWallets.filter((wallet) => wallet.isEVM);
    else if (selectedEcosystem === BlockchainType.Starknet)
      return allWallets.filter((wallet) => wallet.isStarknet);

    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isCoinbaseWallet
    ) {
      allWallets = allWallets.filter((wallet) => wallet.id !== "injected");
    }
    return allWallets;
  }, [availableWallets, connectors, starknetConnectors, selectedEcosystem]);

  const handleClose = useCallback(() => {
    if (address) onClose?.();
    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
  }, [address, onClose, setConnectingWallet]);

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
      if (connector.isBitcoin && connector.isEVM) {
        if (!connector.wallet?.evmWallet || !connector.wallet?.btcWallet)
          return;
        setMultiWalletConnector({
          evm: connector.wallet.evmWallet,
          btc: connector.wallet.btcWallet,
        });
        return;
      }

      if (connector.isBitcoin) {
        if (!connector.wallet?.btcWallet) return;
        const res = await connect(connector.wallet.btcWallet);
        if (res.error) {
          console.log("error connecting wallet", res.error);
        }
      } else if (connector.isEVM) {
        if (!connector.wallet?.evmWallet) return;

        if (
          connector.id === "metaMaskSDK" ||
          connector.id === "io.metamask" ||
          (connector.id === "injected" && window.ethereum?.isMetaMask)
        ) {
          const provider = window.ethereum;
          if (provider && (provider.isMetaMask || provider._metamask)) {
            try {
              const version = await provider.request({
                method: "web3_clientVersion",
                params: [],
              });

              const versionMatch = version.match(/v(\d+\.\d+\.\d+)/);
              const versionNumber = versionMatch ? versionMatch[1] : null;

              if (versionNumber) {
                const [major, minor, patch] = versionNumber
                  .split(".")
                  .map(Number);
                if (major === 12 && minor === 15 && patch === 1) {
                  onClose();
                  setOpenModal(modalNames.versionUpdate);
                  setConnectingWallet(null);
                  return;
                }
              }
            } catch (error) {
              console.error("Error getting MetaMask version:", error);
            }
          }
        }

        await handleEVMConnect(connector.wallet.evmWallet, connectAsync);
        setConnectingWallet(null);
      } else if (connector.isStarknet) {
        if (!connector.wallet?.starknetWallet) return;
        await starknetConnectAsync({
          connector: connector.wallet.starknetWallet,
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <div className="flex max-h-[600px] flex-col gap-[20px] p-3">
      <div className="flex items-center justify-between">
        <Typography size="h4" weight="bold">
          Connect a Wallet
        </Typography>
        <div className="flex gap-4">
          {multiWalletConnector && (
            <ArrowLeftIcon
              className="h-[14px] w-6 cursor-pointer"
              onClick={handleClose}
            />
          )}
          <CloseIcon className="h-[14px] w-6 cursor-pointer" onClick={close} />
        </div>
      </div>

      {!multiWalletConnector && (
        <div className="flex flex-wrap gap-3">
          {Object.values(ecosystems).map((ecosystem, i) => (
            <Chip
              key={i}
              className={`cursor-pointer py-1 pl-3 pr-1 transition-colors ease-cubic-in-out hover:bg-opacity-50`}
              onClick={() => {
                setSelectedEcosystem((prev) =>
                  prev ===
                  BlockchainType[ecosystem.name as keyof typeof BlockchainType]
                    ? null
                    : BlockchainType[
                        ecosystem.name as keyof typeof BlockchainType
                      ]
                );
              }}
            >
              <Typography size="h3" weight="medium">
                {ecosystem.name}
              </Typography>
              <RadioCheckedIcon
                className={`${
                  selectedEcosystem ===
                  BlockchainType[ecosystem.name as keyof typeof BlockchainType]
                    ? "mr-1 w-4"
                    : "w-0"
                } fill-rose transition-all`}
              />
            </Chip>
          ))}
        </div>
      )}

      {multiWalletConnector ? (
        <MultiWalletConnection
          connectors={multiWalletConnector}
          handleClose={handleClose}
        />
      ) : (
        <div className="scrollbar-hide flex flex-col gap-1 overflow-y-auto overscroll-contain rounded-2xl bg-white/50 p-4 transition-all duration-300">
          {allAvailableWallets.length > 0 ? (
            <AnimatePresence>
              {allAvailableWallets.map((wallet) => (
                <WalletRow
                  key={wallet.id}
                  name={wallet.name}
                  logo={wallet.logo}
                  onClick={async () => {
                    await handleConnect(wallet);
                  }}
                  isConnecting={connectingWallet === wallet.id}
                  isConnected={{
                    bitcoin: !!(
                      provider &&
                      (provider.id === wallet.id ||
                        provider.id === evmToBTCid[wallet.id])
                    ),
                    evm: !!(
                      connector &&
                      (connector.id === wallet.id ||
                        (typeof window !== "undefined" &&
                          window.ethereum &&
                          window.ethereum.isCoinbaseWallet &&
                          connector.id === "injected" &&
                          wallet.id === "com.coinbase.wallet"))
                    ),
                    starknet: !!(
                      starknetConnector &&
                      wallet.isStarknet &&
                      starknetConnector.id === wallet.id &&
                      starknetStatus === "connected"
                    ),
                  }}
                  isAvailable={wallet.isAvailable}
                />
              ))}
            </AnimatePresence>
          ) : (
            <Typography size="h3">No wallets found</Typography>
          )}
        </div>
      )}

      <div className="mb-2">
        <Typography size="h4" weight="medium">
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
            href="https://garden.finance/GardenFinancePrivacyPolicy.pdf"
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
