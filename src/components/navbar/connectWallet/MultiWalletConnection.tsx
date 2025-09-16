import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { ecosystems } from "./constants";
import { Connector } from "wagmi";
import { Connector as StarknetConnector } from "@starknet-react/core";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { handleEVMConnect, handleStarknetConnect } from "./handleConnect";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";
import { WalletWithRequiredFeatures as SuiWallet } from "@mysten/wallet-standard";
import { BlockchainType } from "@gardenfi/orderbook";
import { useSuiWallet } from "../../../hooks/useSuiWallet";
type Checked = Record<BlockchainType, boolean>;

type MultiWalletConnectionProps = {
  connectors: {
    [BlockchainType.EVM]?: Connector;
    [BlockchainType.Bitcoin]?: IInjectedBitcoinProvider;
    [BlockchainType.Starknet]?: StarknetConnector;
    [BlockchainType.Solana]?: SolanaWallet;
    [BlockchainType.Sui]?: SuiWallet;
  };
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  connectors,
  handleClose,
}) => {
  const [checked, setChecked] = useState(
    Object.keys(ecosystems).reduce((acc, [key]) => {
      acc[key as BlockchainType] = false;
      return acc;
    }, {} as Checked)
  );
  const [loading, setLoading] = useState(false);

  const { connect, provider } = useBitcoinWallet();
  const { connectAsync, connector: evmConnector } = useEVMWallet();
  const { solanaConnect, solanaSelectedWallet } = useSolanaWallet();
  const {
    starknetConnectAsync,
    starknetDisconnect,
    starknetSwitchChain,
    starknetConnector,
  } = useStarknetWallet();
  const { handleSuiConnect, suiSelectedWallet } = useSuiWallet();
  const availableEcosystems = Object.entries(ecosystems).filter(
    ([, value]) =>
      (value.name === BlockchainType.EVM && connectors.EVM) ||
      (value.name === BlockchainType.Bitcoin && connectors.Bitcoin) ||
      (value.name === BlockchainType.Starknet && connectors.Starknet) ||
      (value.name === BlockchainType.Solana && connectors.Solana) ||
      (value.name === BlockchainType.Sui && connectors.Sui)
  );

  const connectionStatus: Record<BlockchainType, boolean> = {
    [BlockchainType.EVM]: evmConnector?.name === connectors.EVM?.name,
    [BlockchainType.Solana]:
      solanaSelectedWallet?.adapter.name === connectors.Solana?.adapter.name,
    [BlockchainType.Starknet]:
      starknetConnector?.id === connectors.Starknet?.id,
    [BlockchainType.Sui]: suiSelectedWallet?.name === connectors.Sui?.name,
    [BlockchainType.Bitcoin]: provider?.name === connectors.Bitcoin?.name,
  };

  const handleCheck = (ecosystem: BlockchainType) => {
    setChecked((prev) => ({
      ...prev,
      [ecosystem]: !prev[ecosystem],
    }));
  };

  const handleConnect = async () => {
    setLoading(true);

    if (checked[BlockchainType.EVM]) {
      if (connectors.EVM) {
        const res = await handleEVMConnect(connectors.EVM, connectAsync);
        if (res.error) {
          setLoading(false);
          return;
        }
      }
    }

    if (checked[BlockchainType.Bitcoin]) {
      if (!connectors.Bitcoin) {
        setLoading(false);
        return;
      }

      const bitcoinConnectRes = await connect(connectors.Bitcoin);
      if (bitcoinConnectRes.error) {
        setLoading(false);
        return;
      }
    }

    if (checked[BlockchainType.Starknet]) {
      if (!connectors.Starknet) {
        setLoading(false);
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
        return;
      }
    }

    if (checked[BlockchainType.Sui]) {
      if (!connectors.Sui) {
        setLoading(false);
        return;
      }
      await handleSuiConnect(connectors.Sui);
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (checked[BlockchainType.Solana]) {
      if (!connectors.Solana) {
        setLoading(false);
        return;
      }
      await solanaConnect(connectors.Solana.adapter.name);
    }

    setLoading(false);
    handleClose();
  };

  const isAnyEcosystemSelected = Object.values(checked).some((value) => value);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1">
        <img
          src={
            connectors[BlockchainType.Bitcoin]?.icon ??
            connectors[BlockchainType.Solana]?.adapter.icon ??
            connectors[BlockchainType.Starknet]?.icon.toString() ??
            ""
          }
          alt="icon"
          className="h-5 w-5"
        />
        <Typography size="h3" weight="regular">
          {connectors[BlockchainType.Bitcoin]?.name ??
            connectors[BlockchainType.Solana]?.adapter.name ??
            connectors[BlockchainType.Starknet]?.name ??
            ""}
        </Typography>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-white/50 p-4">
        <Typography size="h5" weight="medium" className="px-4">
          Select ecosystems
        </Typography>
        {availableEcosystems.map(([key, ecosystem]) => {
          const isConnected = connectionStatus[key as BlockchainType];

          return (
            <div
              key={key}
              className={`flex cursor-pointer items-center gap-4 rounded-xl px-4 py-4 ${isConnected ? "cursor-default opacity-60" : "hover:bg-off-white"}`}
              onClick={() => {
                if (!isConnected) handleCheck(key as BlockchainType);
              }}
            >
              <img src={ecosystem.icon} alt={"icon"} className="h-8 w-8" />
              <div className="mr-auto flex justify-between">
                <Typography size="h2" weight="regular">
                  {ecosystem.name}
                </Typography>
              </div>
              <CheckBox
                checked={checked[key as BlockchainType] || isConnected}
                className="cursor-pointer"
              />
            </div>
          );
        })}
      </div>
      <Button
        variant={loading || !isAnyEcosystemSelected ? "disabled" : "primary"}
        className="w-full cursor-pointer"
        onClick={handleConnect}
        loading={loading}
        disabled={!isAnyEcosystemSelected}
      >
        {loading ? "Connecting" : "Connect"}
      </Button>
    </div>
  );
};
