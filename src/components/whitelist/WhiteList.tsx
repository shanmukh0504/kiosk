import { FC, useEffect } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { checkIfWhitelisted } from "../../utils/checkIfWhitelisted";
import blossomTestnet from "/blossom-testnet.png";
import blossomMainnet from "/blossom-mainnet.png";
import { Button, LogoutIcon, Typography } from "@gardenfi/garden-book";
import { network } from "../../constants/constants";
import { swapStore } from "../../store/swapStore";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { balanceStore } from "../../store/balanceStore";

type WhiteListProps = {
  open: boolean;
  onClose: () => void;
};

export const Whitelist: FC<WhiteListProps> = ({ onClose }) => {
  const { disconnect } = useEVMWallet();
  const { clear } = swapStore();
  const { disconnect: btcDisconnect } = useBitcoinWallet();
  const { clearBalances } = balanceStore();
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();

  const image = network === "mainnet" ? blossomMainnet : blossomTestnet;

  const handleJoinWaitlist = () =>
    window.open("https://waitlist.garden.finance", "_blank");

  const handleDisconnect = () => {
    clear();
    disconnect();
    onClose();
    btcDisconnect();
    clearBalances();
  };

  useEffect(() => {
    if (!address) return;

    checkIfWhitelisted(address).then((isWhitelisted) => {
      if (!isWhitelisted) {
        setOpenModal(modalNames.whiteList);
      }
    });
  }, [address, setOpenModal]);

  return (
    <div className="mt-2 flex flex-col gap-5 rounded-2xl p-1">
      <img src={image} alt="whitelist" />
      <Typography size="h4">
        <b>Bloom {network}</b> is currently invite-only.
        <br />
        Secure your spot on the waitlist to be among the first
        <br /> to experience it and help shape the future of Garden!
      </Typography>
      <div className="mt-2 flex items-center gap-2">
        <Button className="w-11/12" size="lg" onClick={handleJoinWaitlist}>
          Join the waitlist
        </Button>
        <div
          className="h-full cursor-pointer rounded-2xl bg-dark-grey p-4"
          onClick={handleDisconnect}
        >
          <LogoutIcon className="w-5 cursor-pointer fill-white" />
        </div>
      </div>
    </div>
  );
};
