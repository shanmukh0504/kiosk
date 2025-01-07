import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Loader } from "../../../common/Loader";
import { EcosystemKeys, ecosystems } from "./constants";

type WalletRowProps = {
  name: string;
  logo: string;
  onClick: () => void;
  isConnecting: boolean;
  isConnected: IsConnected;
};

type IsConnected = {
  [key in EcosystemKeys]: boolean;
};

export const WalletRow: FC<WalletRowProps> = ({
  name,
  logo,
  onClick,
  isConnecting,
  isConnected,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-off-white rounded-xl`}
      onClick={onClick}
    >
      <div className="flex gap-4">
        <img src={logo} alt={"icon"} className="w-8 h-8" />
        <div className="flex justify-between items-center">
          <Typography size="h2" weight="medium">
            {name === "Injected"
              ? "Browser Wallet"
              : name.charAt(0).toUpperCase() + name.slice(1)}
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isConnecting && <Loader />}
        {Object.values(isConnected).some((value) => value) && (
          <div className="flex gap-2 bg-white p-1 rounded-full pl-3 pr-2 items-center w-fit">
            <Typography size="h4" className="flex gap-1 items-center">
              Connected
            </Typography>
            <div className="flex gap-1">
              {Object.entries(isConnected).map(
                ([ecosystem, isConnected]) =>
                  isConnected && (
                    <img
                      key={ecosystem}
                      src={ecosystems[ecosystem as EcosystemKeys].icon ?? ""}
                      className="w-4 h-4"
                    />
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
