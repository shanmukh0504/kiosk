import { CloseIcon, Modal, Typography } from "@gardenfi/garden-book";
import React, { useState } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { getAvailableWallets } from "../../constants/supportedEVMWallets";
import { Connector } from "wagmi";
import { Siwe, Url } from "@gardenfi/utils";
import { getWalletClient } from "@wagmi/core";
import { config } from "../../layout/wagmi/config";
import { API } from "../../constants/api";
import { WalletClient } from "viem";
import authStore from "../../store/authStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";
import { modalNames, modalStore } from "../../store/modalStore";

type ConnectWalletProps = {
  open: boolean;
  onClose: () => void;
};

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  open,
  onClose,
}) => {
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const { connectors } = useEVMWallet();
  const { setAuth } = authStore();
  const { setOpenModal } = modalStore();

  const handleConnect = async (connector: Connector, id: string) => {
    try {
      setConnectingWallet(id);
      await connector.connect();
      const walletClient: WalletClient = await getWalletClient(config, {
        connector: connector,
      });
      if (!walletClient?.account) return;

      const whitelisted = await checkIfWhitelisted(
        walletClient.account.address
      );
      if (!whitelisted) {
        setOpenModal(modalNames.whiteList);
        return;
      }

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
    <Modal open={open} onClose={onClose}>
      <Modal.Children
        opacityLevel={"medium"}
        className="flex flex-col gap-6 backdrop-blur-[20px] rounded-2xl w-[600px] p-6"
      >
        <div className="flex justify-between items-center">
          <Typography size="h4" weight="bold">
            Connect a wallet
          </Typography>
          <CloseIcon
            className="w-6 h-[14px] cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
          {Object.entries(getAvailableWallets(connectors)).map(
            ([, wallet], i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-off-white rounded-xl`}
                onClick={async () => {
                  if (!wallet.connector) return;
                  await handleConnect(wallet.connector, wallet.id);
                }}
              >
                <img src={wallet.logo} alt={"icon"} className="w-8 h-8" />
                <div className="flex justify-between w-full">
                  <Typography size="h2" weight="medium">
                    {wallet.name}
                  </Typography>
                  {connectingWallet === wallet.id && (
                    <div className="text-black">connecting...</div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        <div className="mb-2">
          <Typography size="h4" weight="medium">
            By connecting a wallet, you agree to Garden’s Terms of Service and
            Privacy Policy.
          </Typography>
        </div>
      </Modal.Children>
    </Modal>
  );
};
