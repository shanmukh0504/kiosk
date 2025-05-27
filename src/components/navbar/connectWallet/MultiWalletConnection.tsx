import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { blockChainType, EcosystemKeys, ecosystems } from "./constants";
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
import { BlockchainType } from "@gardenfi/orderbook";

type Checked = Record<EcosystemKeys, boolean>;
type MultiWalletConnectionProps = {
  connectors: {
    [BlockchainType.EVM]?: Connector;
    [BlockchainType.Bitcoin]?: IInjectedBitcoinProvider;
    [BlockchainType.Starknet]?: StarknetConnector;
  };
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  connectors,
  handleClose,
}) => {
  const [checked, setChecked] = useState(
    Object.keys(ecosystems).reduce((acc, [key]) => {
      acc[key as blockChainType] = false;
      return acc;
    }, {} as Checked)
  );
  const [loading, setLoading] = useState(false);

  const { connect } = useBitcoinWallet();
  const { connectAsync } = useEVMWallet();
  const { starknetConnectAsync, starknetDisconnect, starknetSwitchChain } =
    useStarknetWallet();

  const availableEcosystems = Object.entries(ecosystems).filter(
    ([, value]) =>
      (value.name === BlockchainType.EVM && connectors.EVM) ||
      (value.name === BlockchainType.Bitcoin && connectors.Bitcoin) ||
      (value.name === BlockchainType.Starknet && connectors.Starknet)
  );

  const handleCheck = (ecosystem: string) => {
    setChecked((prev) => ({
      ...prev,
      [ecosystem]: !prev[ecosystem as EcosystemKeys],
    }));
  };

  const handleConnect = async () => {
    setLoading(true);

    if (checked[BlockchainType.EVM]) {
      if (connectors.EVM) {
        const res = await handleEVMConnect(connectors.EVM, connectAsync);
        if (res.error) {
          setLoading(false);
          handleClose();
          return;
        }
      }
    }

    if (checked[BlockchainType.Bitcoin]) {
      if (!connectors.Bitcoin) {
        setLoading(false);
        handleClose();
        return;
      }

      const bitcoinConnectRes = await connect(connectors.Bitcoin);
      if (bitcoinConnectRes.error) {
        setLoading(false);
        handleClose();
        return;
      }
    }

    if (checked[BlockchainType.Starknet]) {
      if (!connectors.Starknet) {
        setLoading(false);
        handleClose();
        return;
      }
      const starknetConnectRes = await handleStarknetConnect(
        connectors.Starknet,
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
        <img src={connectors.Bitcoin?.icon} alt={"icon"} className="h-5 w-5" />
        <Typography size="h3" weight="medium">
          {connectors.Bitcoin?.name}
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
