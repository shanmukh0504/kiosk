import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Loader } from "../../../common/Loader";

type WalletRowProps = {
  name: string;
  logo: string;
  onClick: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  isEVMWallet?: boolean;
  isBitcoinWallet?: boolean;
};

export const WalletRow: FC<WalletRowProps> = ({
  name,
  logo,
  onClick,
  isConnecting,
  isConnected,
  isEVMWallet,
  isBitcoinWallet,
}) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-off-white rounded-xl`}
      onClick={onClick}
    >
      <img src={logo} alt={"icon"} className="w-8 h-8" />
      <div className="flex justify-between w-full">
        <Typography size="h2" weight="medium">
          {name === "Injected" ? "Browser Wallet" : name}
        </Typography>
        {isConnecting && <Loader />}
      </div>
      {isConnected && (
        <div className="flex gap-1">
          <div className="flex gap-1 items-center bg-white/50 text-dark-grey p-0.5 rounded-full px-1.5 text-[10px]">
            <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
            Connected
          </div>
          <div className="flex gap-1 items-center bg-white/50 p-0.5 text-dark-grey rounded-full px-1.5 text-[10px]">
            {isEVMWallet && "evm"}
            {isBitcoinWallet && "bitcoin"}
          </div>
        </div>
      )}
    </div>
  );
};
