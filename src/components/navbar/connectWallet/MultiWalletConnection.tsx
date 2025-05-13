import { Button, CheckBox, Typography } from "@gardenfi/garden-book";
import { EcosystemKeys, ecosystems } from "./constants";
import { useState, FC, useMemo } from "react";
import { Connector } from "wagmi";
import {
  IInjectedBitcoinProvider,
  useBitcoinWallet,
} from "@gardenfi/wallet-connectors";
import { handleEVMConnect } from "./handleConnect";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { Wallet as SolanaWallet } from "@solana/wallet-adapter-react";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";

type Checked = Record<EcosystemKeys, boolean>;
type MultiWalletConnectionProps = {
  connectors: {
    evm: Connector;
    btc?: IInjectedBitcoinProvider;
    sol?: SolanaWallet;
  };
  handleClose: () => void;
};

export const MultiWalletConnection: FC<MultiWalletConnectionProps> = ({
  connectors,
  handleClose,
}) => {
  const [loading, setLoading] = useState(false);

  const { connect } = useBitcoinWallet();
  const { connectAsync } = useEVMWallet();
  const { solanaConnect } = useSolanaWallet();

  const supportedEcosystems = useMemo(() => {
    const connectorMap = {
      evm: connectors.evm,
      bitcoin: connectors.btc,
      solana: connectors.sol,
    };

    return Object.entries(ecosystems).reduce(
      (acc, [key, ecosystem]) => {
        const k = key as EcosystemKeys;
        if (connectorMap[k as keyof typeof connectorMap]) {
          acc[k] = { ...ecosystem };
        }
        return acc;
      },
      {} as Record<EcosystemKeys, (typeof ecosystems)[EcosystemKeys]>
    );
  }, [connectors]);

  const [checked, setChecked] = useState(
    Object.keys(supportedEcosystems).reduce((acc, key) => {
      if (key === "evm") acc[key as EcosystemKeys] = true;
      else acc[key as EcosystemKeys] = false;
      return acc;
    }, {} as Checked)
  );

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

    try {
      const res = await handleEVMConnect(connectors.evm, connectAsync);

      if (res.error) {
        setLoading(false);
        handleClose();
        return;
      }

      if (checked.bitcoin && connectors.btc) {
        const bitcoinConnectRes = await connect(connectors.btc);
        if (bitcoinConnectRes.error) {
          console.error("Failed to connect Bitcoin wallet");
        }
      }

      if (checked.solana && connectors.sol) {
        solanaConnect(connectors.sol.adapter.name);
      }

      setLoading(false);
      handleClose();
    } catch (error) {
      console.error("Error connecting wallets:", error);
      setLoading(false);
      handleClose();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1">
        {connectors.btc && (
          <>
            <img src={connectors.btc.icon} alt={"icon"} className="h-5 w-5" />
            <Typography size="h3" weight="medium">
              {connectors.btc.name}
            </Typography>
          </>
        )}
        {connectors.sol && (
          <>
            <img
              src={connectors.sol.adapter.icon}
              alt={"icon"}
              className="h-5 w-5"
            />
            <Typography size="h3" weight="medium">
              {connectors.sol.adapter.name}
            </Typography>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-white/50 py-4">
        <Typography size="h5" weight="bold" className="px-4">
          Select ecosystems
        </Typography>
        {Object.entries(supportedEcosystems).map(([key, ecosystem], i) => (
          <div
            key={i}
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
