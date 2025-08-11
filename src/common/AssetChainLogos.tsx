import { FC, HTMLAttributes } from "react";

type AssetChainLogosProps = HTMLAttributes<HTMLDivElement> & {
  tokenLogo?: string;
  chainLogo?: string;
};

export const AssetChainLogos: FC<AssetChainLogosProps> = ({
  tokenLogo,
  chainLogo,
  ...rest
}) => {
  return (
    <div
      className={`relative flex h-5 items-center justify-between ${
        chainLogo ? "w-[36px]" : "w-5"
      }`}
      {...rest}
    >
      <img
        src={tokenLogo}
        className="absolute left-0 z-30 h-5 w-5 rounded-full"
      />
      {chainLogo !== tokenLogo ? (
        <img
          src={chainLogo}
          className="absolute right-0 z-20 h-5 w-5 rounded-full"
        />
      ) : null}
    </div>
  );
};
