import {
  KeyboardDownIcon,
  TimerIcon,
  TokenInfo,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useMemo, useRef } from "react";
import { IOType } from "../../constants/constants";
import { assetInfoStore } from "../../store/assetInfoStore";
import { Asset } from "@gardenfi/orderbook";
import { isBitcoin } from "../../utils/utils";

type SwapInputProps = {
  type: IOType;
  amount: string;
  onChange: (amount: string) => void;
  asset?: Asset;
};

export const SwapInput: FC<SwapInputProps> = ({
  type,
  amount,
  asset,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setOpenAssetSelector, assetsData } = assetInfoStore();

  const network = useMemo(() => {
    if (asset && isBitcoin(asset)) return;
    return asset && assetsData && assetsData[asset.chain];
  }, [asset, asset?.chain]);

  const label = type === IOType.input ? "Send" : "Receive";

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const parts = input.split(".");
    // Check if the last character is a digit or a dot.
    if (
      // If it's a digit
      /^[0-9]$/.test(input.at(-1)!) ||
      // or it's a dot and there is only one dot in the entire string
      (input.at(-1) === "." && parts.length - 1 === 1)
    ) {
      const decimals = (parts[1] || "").length;
      // If there are more than the maximum decimals after the point.
      if (asset && decimals > asset.decimals && parts[1]) {
        // Trim decimals to only keep the maximum amount.
        onChange(parts[0] + "." + parts[1].slice(0, asset.decimals));
      } else {
        // Otherwise, just set the input.
        onChange(input);
      }
      return;
    }
    // If it's an empty string, just set the input.
    else if (input.length === 0) {
      onChange(input);
    }
    // If the last character is not a numerical digit or a dot, and the string
    // is not empty, do nothing and return.
    else {
      return;
    }
  };

  const handleOpenAssetSelector = () => setOpenAssetSelector(type);

  return (
    <>
      <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Typography
              size="h5"
              weight="bold"
              onClick={() => inputRef.current!.focus()}
            >
              {label}
            </Typography>
            <Typography size="h5" weight="medium">
              {/* TODO: Show value in USD */}
            </Typography>
          </div>
          {type === IOType.output && (
            <div className="flex gap-1 items-center">
              <TimerIcon className="h-4" />
              <Typography size="h5" weight="medium">
                {/* TODO: Fetch time estimate */}
                ~30s
              </Typography>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <Typography size="h2" weight="bold">
            <input
              ref={inputRef}
              className="flex-grow outline-none placeholder:text-mid-grey"
              type="text"
              value={amount}
              placeholder="0.0"
              onChange={handleAmountChange}
            />
          </Typography>
          {asset ? (
            <TokenInfo
              symbol={asset.symbol}
              tokenLogo={asset.logo}
              chainLogo={network && network.networkLogo}
              onClick={handleOpenAssetSelector}
            />
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleOpenAssetSelector}
            >
              <Typography size="h2" weight="medium">
                Select token
              </Typography>
              <KeyboardDownIcon className="w-5" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
