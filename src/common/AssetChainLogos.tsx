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
    <div className="flex w-[38px]">
      <img src={tokenLogo} className="w-5 h-5 z-30 translate-x-0.5" />
      {chainLogo ? <img src={chainLogo} className="w-5 h-5 z-20" /> : null}
    </div>
  );
};
