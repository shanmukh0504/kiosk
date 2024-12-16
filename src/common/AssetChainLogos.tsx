import { FC } from "react";

type AssetChainLogosProps = {
  tokenLogo?: string;
  chainLogo?: string;
};

export const AssetChainLogos: FC<AssetChainLogosProps> = ({
  tokenLogo,
  chainLogo,
}) => {
  return (
    <div
      className={`relative flex items-center justify-between h-5 ${
        chainLogo ? "w-[36px]" : "w-5"
      }`}
    >
      <img
        src={tokenLogo}
        className="absolute left-0 w-5 h-5 z-30 rounded-full"
      />
      {chainLogo ? (
        <img
          src={chainLogo}
          className="absolute right-0 w-5 h-5 z-20 rounded-full"
        />
      ) : null}
    </div>
  );
};
