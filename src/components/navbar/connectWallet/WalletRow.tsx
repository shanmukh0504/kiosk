import { Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { Loader } from "../../../common/Loader";

type WalletRowProps = {
  name: string;
  logo: string;
  onClick: () => void;
  isConnecting: boolean;
};

export const WalletRow: FC<WalletRowProps> = ({
  name,
  logo,
  onClick,
  isConnecting,
}) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-off-white rounded-xl`}
      onClick={onClick}
    >
      <img src={logo} alt={"icon"} className="w-8 h-8" />
      <div className="flex justify-between w-full">
        <Typography size="h2" weight="medium">
          {name}
        </Typography>
        {isConnecting && <Loader />}
      </div>
    </div>
  );
};
