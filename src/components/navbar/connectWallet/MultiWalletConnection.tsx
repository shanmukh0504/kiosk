import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { ecosystems } from "./constants";
import { Connector } from "wagmi";
import { Connector as StarknetConnector } from "@starknet-react/core";
import {
  IInjectedBitcoinProvider,
  IInjectedLitecoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { handleEVMConnect, handleStarknetConnect } from "./handleConnect";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";
import { WalletWithRequiredFeatures as SuiWallet } from "@mysten/wallet-standard";
import { Wallet as TronWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { useTronWallet } from "../../../hooks/useTronWallet";
import { BlockchainType } from "@gardenfi/orderbook";

import { useSuiWallet } from "../../../hooks/useSuiWallet";
import { useXRPLWallet } from "../../../hooks/useXRPLWallet";
type Checked = Record<BlockchainType, boolean>;

type MultiWalletConnectionProps = {
  availableBlockchainTypes: Set<BlockchainType>;
  connectors: {
    [BlockchainType.evm]?: Connector;
    [BlockchainType.bitcoin]?: IInjectedBitcoinProvider;
    [BlockchainType.starknet]?: StarknetConnector;
    [BlockchainType.solana]?: SolanaWallet;
    [BlockchainType.sui]?: SuiWallet;
    [BlockchainType.tron]?: TronWallet;
    [BlockchainType.litecoin]?: IInjectedLitecoinProvider;
  };
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  availableBlockchainTypes,
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
    starknetStatus,
  } = useStarknetWallet();
  const { handleSuiConnect, suiSelectedWallet } = useSuiWallet();
  const { handleTronConnect, wallet: tronWallet } = useTronWallet();
  const { handleXRPLConnect, xrplConnected, xrplAddress } = useXRPLWallet();

  const availableEcosystems = Object.entries(ecosystems).filter(([key]) => {
    const type = key as Exclude<BlockchainType, BlockchainType.alpen_signet>;
    if (!availableBlockchainTypes.has(type)) return false;
    return !!connectors[type as keyof typeof connectors];
  });

  const connectionStatus: Record<BlockchainType, boolean> = {
    [BlockchainType.evm]: evmConnector?.name === connectors.evm?.name,
    [BlockchainType.solana]:
      solanaSelectedWallet?.adapter.name === connectors.solana?.adapter.name,
    [BlockchainType.starknet]:
      starknetStatus === "connected" &&
      starknetConnector?.id === connectors.starknet?.id,
    [BlockchainType.sui]: suiSelectedWallet?.name === connectors.sui?.name,
    [BlockchainType.bitcoin]: provider?.name === connectors.bitcoin?.name,
    [BlockchainType.tron]:
      tronWallet?.adapter.name === connectors.tron?.adapter.name,
    [BlockchainType.xrpl]: xrplConnected && !!xrplAddress,
    [BlockchainType.litecoin]: false,
    [BlockchainType.alpen_signet]: false,
    [BlockchainType.spark]: false,
  };

  const handleCheck = (ecosystem: BlockchainType) => {
    setChecked((prev) => ({
      ...prev,
      [ecosystem]: !prev[ecosystem],
    }));
  };

  const handleConnect = async () => {
    setLoading(true);

    if (checked[BlockchainType.evm]) {
      if (connectors.evm) {
        const res = await handleEVMConnect(connectors.evm, connectAsync);
        if (res.error) {
          setLoading(false);
          return;
        }
      }
    }

    if (checked[BlockchainType.bitcoin]) {
      if (!connectors.bitcoin) {
        setLoading(false);
        return;
      }

      const bitcoinConnectRes = await connect(connectors.bitcoin);
      if (bitcoinConnectRes.error) {
        setLoading(false);
        return;
      }
    }

    if (checked[BlockchainType.starknet]) {
      if (!connectors.starknet) {
        setLoading(false);
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
        return;
      }
    }

    if (checked[BlockchainType.sui]) {
      if (!connectors.sui) {
        setLoading(false);
        return;
      }
      await handleSuiConnect(connectors.sui);
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (checked[BlockchainType.solana]) {
      if (!connectors.solana) {
        setLoading(false);
        return;
      }
      await solanaConnect(connectors.solana.adapter.name);
    }

    if (checked[BlockchainType.tron]) {
      if (!connectors.tron) {
        setLoading(false);
        return;
      }
      await handleTronConnect(connectors.tron);
    }

    if (checked[BlockchainType.xrpl]) {
      const success = await handleXRPLConnect();
      if (!success) {
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    handleClose();
  };

  const isAnyEcosystemSelected = Object.values(checked).some((value) => value);

  return (
    <div className="flex flex-col gap-5" data-testid="connect-wallet-multi">
      <div
        className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1"
        data-testid="connect-wallet-multi-wallet-chip"
      >
        <img
          src={
            connectors[BlockchainType.bitcoin]?.icon ??
            connectors[BlockchainType.solana]?.adapter.icon ??
            connectors[BlockchainType.starknet]?.icon.toString() ??
            ""
          }
          alt="icon"
          className="h-5 w-5"
        />
        <Typography size="h3" weight="regular">
          {connectors[BlockchainType.bitcoin]?.name ??
            connectors[BlockchainType.solana]?.adapter.name ??
            connectors[BlockchainType.starknet]?.name ??
            ""}
        </Typography>
      </div>
      <div
        className="flex flex-col gap-1 rounded-2xl bg-white/50 p-4"
        data-testid="connect-wallet-multi-ecosystem-list"
      >
        <Typography size="h5" weight="medium" className="px-4">
          Select ecosystems
        </Typography>
        {availableEcosystems.map(([key, ecosystem]) => {
          const isConnected = connectionStatus[key as BlockchainType];

          return (
            <div
              key={key}
              className={`flex cursor-pointer items-center gap-4 rounded-xl px-4 py-4 ${isConnected ? "cursor-default opacity-60" : "hover:bg-off-white"}`}
              data-testid={`connect-wallet-multi-ecosystem-${key}`}
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
                data-testid={`connect-wallet-multi-checkbox-${key}`}
              />
            </div>
          );
        })}
      </div>
      <Button
        variant={loading || !isAnyEcosystemSelected ? "disabled" : "primary"}
        className="w-full cursor-pointer"
        data-testid="connect-wallet-multi-connect"
        onClick={handleConnect}
        loading={loading}
        disabled={!isAnyEcosystemSelected}
      >
        {loading ? "Connecting" : "Connect"}
      </Button>
    </div>
  );
};
