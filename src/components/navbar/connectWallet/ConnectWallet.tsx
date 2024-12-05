import { CloseIcon, Modal, Typography } from "@gardenfi/garden-book";
import React, { useState, FC, useMemo } from "react";
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
import { evmToBTCid } from "./constants";
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
  const [multiWalletConnector, setMultiWalletConnector] = useState<{
    evm: Connector;
    btc: IInjectedBitcoinProvider;
  }>();
  const { connectors, connectAsync, connector, address } = useEVMWallet();
  const { availableWallets, connect, provider, account } = useBitcoinWallet();

  const { setOpenModal } = modalStore();
  const { setAuth } = authStore();

  const showIsEVMMandatory = useMemo(
    () => isBTCWallets && !!(account && !address),
    [isBTCWallets, account, address]
  );

  const handleClose = () => {
    setConnectingWallet(null);
    setMultiWalletConnector(undefined);
    if (address && account) {
      onClose();
    }
  };

  const handleConnect = async (connector: Connector, id: string) => {
    const btcId = evmToBTCid[id];
    if (btcId && availableWallets[btcId]) {
      setMultiWalletConnector({
        evm: connector,
        btc: availableWallets[btcId],
      });
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
      {multiWalletConnector ? (
        <MultiWalletConnection
          connectors={multiWalletConnector}
          handleClose={handleClose}
        />
      ) : (
        <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
          {!isBTCWallets &&
            connectors.map((wallet, i) => (
              <WalletRow
                key={i}
                name={wallet.name}
                logo={WalletLogos[wallet.id] ?? wallet.icon}
                onClick={async () => {
                  if (!wallet) return;
                  await handleConnect(wallet, wallet.id);
                }}
                isConnecting={connectingWallet === wallet.id}
                isConnected={connector?.id === wallet.id}
                isEVMWallet
              />
            ))}
          {Object.entries(availableWallets).map(([name, wallet], i) => (
            <WalletRow
              key={i}
              name={name}
              logo={WalletLogos[name]}
              onClick={async () => {
                handleConnectBTCWallet(wallet, name);
              }}
              isConnecting={connectingWallet === name}
              isConnected={provider?.id === wallet.id}
              isBitcoinWallet
            />
          ))}
        </div>
      )}

      <div className="mb-2">
        {showIsEVMMandatory && (
          <>
            <Typography size="h5" weight="medium" className="!text-red-600">
              * EVM wallet connection is mandatory
            </Typography>
            <br />
          </>
        )}
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
