import { CloseIcon, Modal, Typography } from "@gardenfi/garden-book";
import React, { useState, FC, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Connector } from "wagmi";
import { Siwe, Url } from "@gardenfi/utils";
import { getWalletClient } from "@wagmi/core";
import { config } from "../../layout/wagmi/config";
import { API } from "../../constants/api";
import { WalletClient } from "viem";
import authStore from "../../store/authStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";
import { modalNames, modalStore } from "../../store/modalStore";
import { BottomSheet } from "../../common/BottomSheet";
import { useViewport } from "../../hooks/useViewport";
import { BREAKPOINTS } from "../../constants/constants";
import { Loader } from "../../common/Loader";
import { WalletLogos } from "../../constants/supportedEVMWallets";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};

export const ConnectWalletComponent: React.FC<ConnectWalletProps> = ({
  onClose,
}) => {
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const { connectors, connectAsync } = useEVMWallet();
  const { setAuth } = authStore();
  const { setOpenModal } = modalStore();

  const handleConnect = async (connector: Connector, id: string) => {
    try {
      setConnectingWallet(id);
      const res = await connectAsync({
        connector,
      });
      const address = res.accounts[0];
      if (!address) return;

      const whitelisted = await checkIfWhitelisted(address);
      if (!whitelisted) {
        setOpenModal(modalNames.whiteList);
        onClose();
        return;
      }

      const walletClient: WalletClient = await getWalletClient(config, {
        connector,
      });
      if (!walletClient) return;

      const auth = new Siwe(new Url(API().orderbook), walletClient, {
        store: localStorage,
        domain: window.location.hostname,
      });
      const authToken = await auth.getToken();

      if (authToken.val && !authToken.error) {
        setAuth(authToken.val);
        onClose();
      }
    } catch (error) {
      console.warn("error :", error);
      setConnectingWallet(null);
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Typography size="h4" weight="bold">
          Connect a wallet
        </Typography>
        <CloseIcon className="w-6 h-[14px] cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
        {connectors.map((wallet, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-off-white rounded-xl`}
            onClick={async () => {
              if (!wallet) return;
              await handleConnect(wallet, wallet.id);
            }}
          >
            <img
              src={WalletLogos[wallet.id] || wallet.icon}
              alt={"icon"}
              className="w-8 h-8"
            />
            <div className="flex justify-between w-full">
              <Typography size="h2" weight="medium">
                {wallet.name === "Injected" ? "Browser Wallet" : wallet.name}
              </Typography>
              {connectingWallet === wallet.id && <Loader />}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-2">
        <Typography size="h4" weight="medium">
          By connecting a wallet, you agree to Garden’s Terms of Service and
          Privacy Policy.
        </Typography>
      </div>
    </>
  );
};

export const ConnectWallet: FC<ConnectWalletProps> = ({ open, onClose }) => {
  const { width } = useViewport();
  const isMobile = useMemo(() => {
    return (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      width < BREAKPOINTS.sm
    );
  }, [width]);

  return (
    <>
      {isMobile ? (
        <BottomSheet open={open} onOpenChange={onClose}>
          <ConnectWalletComponent open={open} onClose={onClose} />
        </BottomSheet>
      ) : (
        <Modal open={open} onClose={onClose}>
          <Modal.Children
            opacityLevel={"medium"}
            className="flex flex-col gap-6 backdrop-blur-[20px] rounded-2xl w-[600px] p-6"
          >
            <ConnectWalletComponent open={open} onClose={onClose} />
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
