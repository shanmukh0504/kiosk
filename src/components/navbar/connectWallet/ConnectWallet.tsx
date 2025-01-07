import {
  ArrowLeftIcon,
  CloseIcon,
  Modal,
  Typography,
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
import { evmToBTCid } from "./constants";

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
  const { connectors, connectAsync, connector, address } = useEVMWallet();
  const { availableWallets, connect, provider } = useBitcoinWallet();

  const { setOpenModal } = modalStore();
  const { setAuth } = authStore();

  const allAvailableWallets = useMemo(() => {
    return showOnlyBTCWallets
      ? getAvailableWallets(availableWallets)
      : getAvailableWallets(availableWallets, connectors);
  }, [showOnlyBTCWallets, availableWallets, connectors]);

  const handleClose = () => {
    if (address) onClose();

    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
  };

  const close = () => {
    onClose();
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
    <>
      <div className="flex justify-between items-center">
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
      {multiWalletConnector ? (
        <MultiWalletConnection
          connectors={multiWalletConnector}
          handleClose={handleClose}
        />
      ) : (
        <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
          {allAvailableWallets.length > 0 ? (
            allAvailableWallets.map((wallet) => (
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
            ))
          ) : (
            <Typography size="h3">No wallets found</Typography>
          )}
        </div>
      )}

      <div className="mb-2">
        <Typography size="h4" weight="medium">
          By connecting a wallet, you agree to Garden’s{" "}
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
            className="flex flex-col gap-6 backdrop-blur-[20px] rounded-2xl w-[600px] p-6"
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
