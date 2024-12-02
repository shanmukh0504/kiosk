import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { bitcoinWallets, EcosystemKeys, ecosystems } from "./constants";
import { useState, FC } from "react";
import { Connector } from "wagmi";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { handleEVMConnect } from "./handleConnect";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { authStore } from "../../../store/authStore";
import { modalNames, modalStore } from "../../../store/modalStore";

type Checked = Record<EcosystemKeys, boolean>;
type MultiWalletConnectionProps = {
  connector: Connector;
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  connector,
  handleClose,
}) => {
  const [checked, setChecked] = useState(
    Object.keys(ecosystems).reduce((acc, key) => {
      if (key === "evm") acc[key as EcosystemKeys] = true;
      else acc[key as EcosystemKeys] = false;
      return acc;
    }, {} as Checked)
  );
  const [loading, setLoading] = useState(false);

  const { availableWallets, connect } = useBitcoinWallet();
  const { connectAsync } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { setAuth } = authStore();

  const handleCheck = (ecosystem: string) => {
    if (ecosystem === "evm") {
      return;
    }
    setChecked((prev) => ({
      ...prev,
      [ecosystem]: !prev[ecosystem as EcosystemKeys],
    }));
  };

  const handleConnect = async () => {
    setLoading(true);

    const res = await handleEVMConnect(connector, connectAsync);
    if (res && !res.isWhitelisted) {
      setOpenModal(modalNames.whiteList);
      handleClose();
    }
    if (res && res.auth) {
      setAuth(res.auth);
    }

    if (!checked.bitcoin) {
      setLoading(false);
      handleClose();
      return;
    }

    const bitcoinWalletKey =
      bitcoinWallets[connector.id as keyof typeof bitcoinWallets];
    const bitcoinWallet = availableWallets[bitcoinWalletKey];
    if (!bitcoinWallet) {
      setLoading(false);
      handleClose();
      return;
    }

    const bitcoinConnectRes = await connect(bitcoinWallet);
    if (!bitcoinConnectRes.error) {
      setLoading(false);
      handleClose();
    }
    setLoading(false);
    // handleClose();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>{connector.id}</div>
      <div className="flex flex-col gap-1 bg-white/50 rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Select ecosystems
        </Typography>
        {Object.entries(ecosystems).map(([key, ecosystem], i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-off-white rounded-xl"
            onClick={() => {
              handleCheck(key);
            }}
          >
            <img src={ecosystem.icon} alt={"icon"} className="w-8 h-8" />
            <div className="flex justify-between mr-auto">
              <Typography size="h2" weight="medium">
                {ecosystem.name}
              </Typography>
            </div>
            <CheckBox
              checked={checked[key as EcosystemKeys]}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
      <Button
        variant={loading ? "disabled" : "primary"}
        className="w-full cursor-pointer"
        onClick={handleConnect}
        loading={loading}
      >
        {loading ? "Connecting" : "Connect"}
      </Button>
    </div>
  );
};
