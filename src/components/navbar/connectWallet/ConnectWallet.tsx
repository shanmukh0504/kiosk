import { CloseIcon, Modal, Typography } from "@gardenfi/garden-book";
import React, { useState, FC } from "react";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { Connector } from "wagmi";
import { BottomSheet } from "../../../common/BottomSheet";
import { useViewport } from "../../../hooks/useViewport";
import { WalletLogos } from "../../../constants/supportedEVMWallets";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { WalletRow } from "./WalletRow";
import { btcSupportedWallets } from "./constants";
import { MultiWalletConnection } from "./MultiWalletConnection";
import { handleEVMConnect } from "./handleConnect";
import { modalNames, modalStore } from "../../../store/modalStore";
import { authStore } from "../../../store/authStore";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
  isBTCWallets: boolean;
};

export const ConnectWalletComponent: React.FC<ConnectWalletProps> = ({
  isBTCWallets,
  onClose,
}) => {
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [isMultiWallet, setIsMultiWallet] = useState<Connector>();
  const { connectors, connectAsync } = useEVMWallet();
  const { availableWallets, connect } = useBitcoinWallet();
  const { setOpenModal } = modalStore();
  const { setAuth } = authStore();

  const handleClose = () => {
    onClose();
    setConnectingWallet(null);
    setIsMultiWallet(undefined);
  };

  const handleConnect = async (connector: Connector, id: string) => {
    if (btcSupportedWallets.includes(id)) {
      setIsMultiWallet(connector);
      return;
    }

    setConnectingWallet(id);
    const res = await handleEVMConnect(connector, connectAsync);
    if (res && !res.isWhitelisted) {
      setOpenModal(modalNames.whiteList);
      handleClose();
    }
    if (res?.auth) {
      setAuth(res.auth);
      handleClose();
    }
    setConnectingWallet(null);
  };

  const handleConnectBTCWallet = async (
    wallet: IInjectedBitcoinProvider,
    name: string
  ) => {
    setConnectingWallet(name);
    const res = await connect(wallet);
    if (res.error) {
      console.log("error connecting wallet", res.error);
      setConnectingWallet(null);
    }
    handleClose();
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Typography size="h4" weight="bold">
          Connect a wallet
        </Typography>
        <CloseIcon
          className="w-6 h-[14px] cursor-pointer"
          onClick={handleClose}
        />
      </div>
      {isMultiWallet ? (
        <MultiWalletConnection
          connector={isMultiWallet}
          handleClose={handleClose}
        />
      ) : (
        <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
          {isBTCWallets
            ? Object.entries(availableWallets).map(([name, wallet], i) => (
                <WalletRow
                  key={i}
                  name={name}
                  logo={WalletLogos[name]}
                  onClick={async () => {
                    handleConnectBTCWallet(wallet, name);
                  }}
                  isConnecting={connectingWallet === name}
                />
              ))
            : connectors.map((wallet, i) => (
                <WalletRow
                  key={i}
                  name={
                    wallet.name === "Injected" ? "Browser Wallet" : wallet.name
                  }
                  logo={WalletLogos[wallet.id] ?? wallet.icon}
                  onClick={async () => {
                    if (!wallet) return;
                    await handleConnect(wallet, wallet.id);
                  }}
                  isConnecting={connectingWallet === wallet.id}
                />
              ))}
        </div>
      )}

      <div className="mb-2">
        <Typography size="h4" weight="medium">
          By connecting a wallet, you agree to Garden’s Terms of Service and
          Privacy Policy.
        </Typography>
      </div>
    </>
  );
};

export const ConnectWallet: FC<ConnectWalletProps> = ({
  open,
  onClose,
  isBTCWallets,
}) => {
  const { isMobile } = useViewport();

  return (
    <>
      {isMobile ? (
        <BottomSheet open={open} onOpenChange={onClose}>
          <ConnectWalletComponent
            open={open}
            onClose={onClose}
            isBTCWallets={isBTCWallets}
          />
        </BottomSheet>
      ) : (
        <Modal open={open} onClose={onClose}>
          <Modal.Children
            opacityLevel={"medium"}
            className="flex flex-col gap-6 backdrop-blur-[20px] rounded-2xl w-[600px] p-6"
          >
            <ConnectWalletComponent
              open={open}
              onClose={onClose}
              isBTCWallets={isBTCWallets}
            />
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
