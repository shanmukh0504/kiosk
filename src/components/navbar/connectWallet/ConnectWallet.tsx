import {
  ArrowLeftIcon,
  Chip,
  CloseIcon,
  KeyboardRightIcon,
  Modal,
  RadioCheckedIcon,
  Typography,
  WalletIcon,
} from "@gardenfi/garden-book";
import React, { useState, FC, useMemo } from "react";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { Connector } from "wagmi";
import { BottomSheet } from "../../../common/BottomSheet";
import { useViewport } from "../../../hooks/useViewport";
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
import { ecosystems, evmToBTCid, maxVisibleWallets } from "./constants";
import { AnimatePresence } from "framer-motion";
import { BREAKPOINTS } from "../../../constants/constants";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
  showOnlyBTCWallets: boolean;
};

export const ConnectWalletComponent: React.FC<ConnectWalletProps> = ({
  showOnlyBTCWallets,
  onClose,
}) => {
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [multiWalletConnector, setMultiWalletConnector] = useState<{
    evm: Connector;
    btc: IInjectedBitcoinProvider;
  }>();
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(
    null
  );
  const [showAllWallets, setShowAllWallets] = useState(false);

  const { connectors, connectAsync, connector, address } = useEVMWallet();
  const { availableWallets, connect, provider } = useBitcoinWallet();
  const { setOpenModal } = modalStore();
  const { setAuth } = authStore();

  const allAvailableWallets = useMemo(() => {
    if (showOnlyBTCWallets) return getAvailableWallets(availableWallets);

    const allWallets = getAvailableWallets(availableWallets, connectors);

    if (selectedEcosystem === "Bitcoin")
      return allWallets.filter((wallet) => wallet.isBitcoin);
    else if (selectedEcosystem === "EVM")
      return allWallets.filter((wallet) => wallet.isEVM);

    return allWallets;
  }, [showOnlyBTCWallets, availableWallets, connectors, selectedEcosystem]);

  const visibleWallets = showAllWallets
    ? allAvailableWallets
    : allAvailableWallets.slice(0, maxVisibleWallets);

  const handleClose = () => {
    if (address) onClose();

    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
  };

  const close = () => {
    onClose();
    setConnectingWallet(null);
    setShowAllWallets(false)
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
    <>
      <div className="flex justify-between items-center ">
        <Typography size="h4" weight="bold">
          Connect a wallet
        </Typography>
        <div className="flex gap-4">
          {multiWalletConnector && (
            <ArrowLeftIcon
              className="w-6 h-[14px] cursor-pointer"
              onClick={handleClose}
            />
          )}
          <CloseIcon className="w-6 h-[14px] cursor-pointer" onClick={close} />
        </div>
      </div>

      {!showOnlyBTCWallets && !multiWalletConnector && (
        <div className="flex flex-wrap gap-3 ">
          {Object.values(ecosystems).map((ecosystem, i) => (
            <Chip
              key={i}
              className={`py-1 pl-3 pr-1 cursor-pointer transition-colors ease-cubic-in-out hover:bg-opacity-50`}
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
                className={`${selectedEcosystem === ecosystem.name ? "w-4 mr-1" : "w-0"
                  } transition-all fill-rose`}
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
        <div className="flex flex-col gap-1 bg-white/50 rounded-2xl  p-4 overflow-y-auto scrollbar-hide transition-all duration-300 ">
          {allAvailableWallets.length > 0 ? (
            <>
              <AnimatePresence >
                {visibleWallets.map((wallet) => (
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
                      evm: !!(connector && connector.id === wallet.id),
                    }}
                    isAvailable={wallet.isAvailable}
                  />
                ))}
              </AnimatePresence>
              {!showAllWallets && allAvailableWallets.length > maxVisibleWallets && (
                <div
                  onClick={() => setShowAllWallets(true)}
                  className={`flex justify-between items-center cursor-pointer px-4 ${BREAKPOINTS.sm ? "py-4" : "py-3"}`}
                >
                  <div className="flex gap-8 items-center">
                    <WalletIcon className="fill-rose h-5 w-5 " />
                    <Typography
                      size="h3"
                      breakpoints={{
                        sm: "h2",
                      }}
                      weight="medium">
                      All Wallets
                    </Typography>
                  </div>
                  <KeyboardRightIcon className="" />
                </div>
              )}
            </>
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
    </>
  );
};

export const ConnectWallet: FC<ConnectWalletProps> = ({
  open,
  onClose,
  showOnlyBTCWallets,
}) => {
  const { isMobile } = useViewport();

  return (
    <>
      {isMobile ? (
        <BottomSheet open={open} onOpenChange={onClose}>
          <ConnectWalletComponent
            open={open}
            onClose={onClose}
            showOnlyBTCWallets={showOnlyBTCWallets}
          />
        </BottomSheet>
      ) : (
        <Modal open={open}>
          <Modal.Children
            opacityLevel={"medium"}
            className="flex flex-col gap-6 backdrop-blur-[20px] rounded-2xl w-[600px] p-6 max-h-[692px]"
          >
            <ConnectWalletComponent
              open={open}
              onClose={onClose}
              showOnlyBTCWallets={showOnlyBTCWallets}
            />
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
