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
    <div className="flex">
      <img src={tokenLogo} className="w-5 h-5 z-30" />
      {chainLogo ? (
        <img src={chainLogo} className="w-5 h-5 z-20 -translate-x-1" />
      ) : null}
    </div>
  );
};
