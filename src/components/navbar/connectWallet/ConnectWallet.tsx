import React, { useState, useMemo } from "react";
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
import { authStore } from "../../../store/authStore";
import { ecosystems, evmToBTCid } from "./constants";
import { AnimatePresence } from "framer-motion";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onClose }) => {
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [multiWalletConnector, setMultiWalletConnector] = useState<{
    evm: Connector;
    btc: IInjectedBitcoinProvider;
  }>();
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(
    null
  );

  const { connectors, connectAsync, connector, address } = useEVMWallet();
  const { availableWallets, connect, provider } = useBitcoinWallet();
  const { modalData, setOpenModal } = modalStore();
  const { setAuth } = authStore();

  const showOnlyBTCWallets = !!modalData.connectWallet?.isBTCWallets;

  const allAvailableWallets = useMemo(() => {
    if (showOnlyBTCWallets) return getAvailableWallets(availableWallets);
    let allWallets;
    allWallets = getAvailableWallets(availableWallets, connectors);

    if (selectedEcosystem === "Bitcoin")
      return allWallets.filter((wallet) => wallet.isBitcoin);
    else if (selectedEcosystem === "EVM")
      return allWallets.filter((wallet) => wallet.isEVM);

    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isCoinbaseWallet
    ) {
      allWallets = allWallets.filter((wallet) => wallet.id !== "injected");
    }
    return allWallets;
  }, [showOnlyBTCWallets, availableWallets, connectors, selectedEcosystem]);

  const handleClose = () => {
    if (address) onClose?.();

    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
  };

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
    if (connector.isBitcoin && connector.isEVM) {
      if (!connector.wallet?.evmWallet || !connector.wallet?.btcWallet) return;
      setMultiWalletConnector({
        evm: connector.wallet.evmWallet,
        btc: connector.wallet.btcWallet,
      });
      return;
    }
    setConnectingWallet(connector.id);
    if (connector.isBitcoin) {
      if (!connector.wallet?.btcWallet) return;
      const res = await connect(connector.wallet.btcWallet);
      if (res.error) {
        console.log("error connecting wallet", res.error);
        setConnectingWallet(null);
      }
    } else if (connector.isEVM) {
      if (!connector.wallet?.evmWallet) return;
      const res = await handleEVMConnect(
        connector.wallet.evmWallet,
        connectAsync
      );
      if (res && !res.isWhitelisted) {
        setOpenModal(modalNames.whiteList);
        onClose();
        handleClose();
      }
      if (res?.auth) {
        setAuth(res.auth);
        handleClose();
      }
      setConnectingWallet(null);
    }
    setConnectingWallet(null);
  };

  return (
    <div className="flex max-h-[600px] flex-col gap-[20px] p-3">
      <div className="flex items-center justify-between">
        <Typography size="h4" weight="bold">
          Connect a wallet
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

      {!showOnlyBTCWallets && !multiWalletConnector && (
        <div className="flex flex-wrap gap-3">
          {Object.values(ecosystems).map((ecosystem, i) => (
            <Chip
              key={i}
              className={`cursor-pointer py-1 pl-3 pr-1 transition-colors ease-cubic-in-out hover:bg-opacity-50`}
              onClick={() => {
                setSelectedEcosystem((prev) =>
                  prev === ecosystem.name ? null : ecosystem.name
                );
              }}
            >
              <Typography size="h3" weight="medium">
                {ecosystem.name}
              </Typography>
              <RadioCheckedIcon
                className={`${
                  selectedEcosystem === ecosystem.name ? "mr-1 w-4" : "w-0"
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
