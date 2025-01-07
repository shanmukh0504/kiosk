import { CloseIcon, Modal, Typography } from "@gardenfi/garden-book";
import React, { useState, FC } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Connector } from "wagmi";
import { Siwe, Url } from "@gardenfi/utils";
import { getWalletClient } from "@wagmi/core";
import { config } from "../../layout/wagmi/config";
import { API } from "../../constants/api";
import { WalletClient } from "viem";
import { authStore } from "../../store/authStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";
import { modalNames, modalStore } from "../../store/modalStore";
import { BottomSheet } from "../../common/BottomSheet";
import { useViewport } from "../../hooks/useViewport";
import { Loader } from "../../common/Loader";
// import { WalletLogos } from "../../constants/supportedEVMWallets";
import { SUPPORTED_WALLETS } from "../../constants/constants";

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
  console.log(connectors);

  const sortedWallets = Object.entries(SUPPORTED_WALLETS).sort(
    ([keyA, walletA], [keyB, walletB]) => {
      console.log("Sorting bhai");
      if (keyA === "Injected") return -1;
      if (keyB === "Injected") return 1;

      const isAAvailable = connectors.some((c) => c.name === walletA.name);
      const isBAvailable = connectors.some((c) => c.name === walletB.name);
      return isAAvailable === isBAvailable ? 0 : isAAvailable ? -1 : 1;
    }
  );

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
        {sortedWallets.map(([key, wallet]) => {
          const connector = connectors.find(
            (connector) => connector.name === key
          );
          const isDisabled = !connector;

          return (
            <div
              key={key}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-off-white"
              }`}
              onClick={async () => {
                if (!isDisabled && connector) {
                  await handleConnect(connector, key);
                }
              }}
            >
              <img
                src={wallet.imgSrc}
                alt={`${wallet.name} icon`}
                className="w-8 h-8"
              />
              <div className="flex justify-between w-full">
                <Typography size="h2" weight="medium">
                  {wallet.name}
                </Typography>
                {connectingWallet === key && <Loader />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mb-2">
        <Typography size="h4" weight="medium">
          By connecting a wallet, you agree to Garden&apos;s Terms of Service
          and Privacy Policy.
        </Typography>
      </div>
    </>
  );
};

export const ConnectWallet: FC<ConnectWalletProps> = ({ open, onClose }) => {
  const { isMobile } = useViewport();

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
