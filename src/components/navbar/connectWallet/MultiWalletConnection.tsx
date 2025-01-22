import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { EcosystemKeys, ecosystems } from "./constants";
import { useState, FC } from "react";
import { Connector } from "wagmi";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { handleEVMConnect } from "./handleConnect";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { authStore } from "../../../store/authStore";
import { modalNames, modalStore } from "../../../store/modalStore";

type Checked = Record<EcosystemKeys, boolean>;
type MultiWalletConnectionProps = {
  connectors: {
    evm: Connector;
    btc: IInjectedBitcoinProvider;
  };
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  connectors,
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

  const { connect } = useBitcoinWallet();
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

    const res = await handleEVMConnect(connectors.evm, connectAsync);

    if (!res) {
      setLoading(false);
      handleClose();
      return;
    }

    if (res && !res.isWhitelisted) {
      setOpenModal(modalNames.whiteList);
      handleClose();
      return;
    }
    if (res && res.auth) setAuth(res.auth);

    if (!checked.bitcoin) {
      setLoading(false);
      handleClose();
      return;
    }

    const bitcoinConnectRes = await connect(connectors.btc);
    if (!bitcoinConnectRes.error) {
      setLoading(false);
      handleClose();
      return;
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 bg-white py-1 px-3 rounded-full w-fit">
        <img src={connectors.btc.icon} alt={"icon"} className="w-5 h-5" />
        <Typography size="h3" weight="medium">
          {connectors.btc.name}
        </Typography>
      </div>
      <div className="flex flex-col gap-1 bg-white/50 rounded-2xl py-4">
        <Typography size="h5" weight="bold" className="px-4">
          Select ecosystems
        </Typography>
        {Object.entries(ecosystems).map(([key, ecosystem], i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-off-white rounded-xl"
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
