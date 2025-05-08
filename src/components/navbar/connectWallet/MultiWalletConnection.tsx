import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { EcosystemKeys, ecosystems } from "./constants";
import { useState, FC } from "react";
import { Connector } from "wagmi";
import { Connector as StarknetConnector } from "@starknet-react/core";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { handleEVMConnect, handleStarknetConnect } from "./handleConnect";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";

type Checked = Record<EcosystemKeys, boolean>;
type MultiWalletConnectionProps = {
  connectors: {
    evm?: Connector;
    btc: IInjectedBitcoinProvider;
    starknet?: StarknetConnector;
  };
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  connectors,
  handleClose,
}) => {
  const availableEcosystems = Object.entries(ecosystems).filter(
    ([key]) =>
      (key === "evm" && connectors.evm) ||
      (key === "bitcoin" && connectors.btc) ||
      (key === "starknet" && connectors.starknet)
  );

  const [checked, setChecked] = useState(
    availableEcosystems.reduce((acc, [key]) => {
      acc[key as EcosystemKeys] = false;
      return acc;
    }, {} as Checked)
  );
  const [loading, setLoading] = useState(false);

  const { connect } = useBitcoinWallet();
  const { connectAsync } = useEVMWallet();
  const { starknetConnectAsync, starknetDisconnect, starknetSwitchChain } =
    useStarknetWallet();

  const handleCheck = (ecosystem: string) => {
    setChecked((prev) => ({
      ...prev,
      [ecosystem]: !prev[ecosystem as EcosystemKeys],
    }));
  };

  const handleConnect = async () => {
    setLoading(true);

    if (checked.evm) {
      if (connectors.evm) {
        const res = await handleEVMConnect(connectors.evm, connectAsync);
        if (res.error) {
          setLoading(false);
          handleClose();
          return;
        }
      }
    }

    if (checked.bitcoin) {
      if (!connectors.btc) {
        setLoading(false);
        handleClose();
        return;
      }

      const bitcoinConnectRes = await connect(connectors.btc);
      if (bitcoinConnectRes.error) {
        setLoading(false);
        handleClose();
        return;
      }
    }

    if (checked.starknet) {
      if (!connectors.starknet) {
        setLoading(false);
        handleClose();
        return;
      }
      const starknetConnectRes = await handleStarknetConnect(
        connectors.starknet,
        starknetConnectAsync,
        starknetSwitchChain,
        starknetDisconnect
      );
      if (starknetConnectRes.error) {
        setLoading(false);
        handleClose();
        return;
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1">
        <img src={connectors.btc.icon} alt={"icon"} className="h-5 w-5" />
        <Typography size="h3" weight="medium">
          {connectors.btc.name}
        </Typography>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-white/50 py-4">
        <Typography size="h5" weight="bold" className="px-4">
          Select ecosystems
        </Typography>
        {availableEcosystems.map(([key, ecosystem]) => (
          <div
            key={key}
            className="flex cursor-pointer items-center gap-4 rounded-xl px-4 py-4 hover:bg-off-white"
            onClick={() => {
              handleCheck(key);
            }}
          >
            <img src={ecosystem.icon} alt={"icon"} className="h-8 w-8" />
            <div className="mr-auto flex justify-between">
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
