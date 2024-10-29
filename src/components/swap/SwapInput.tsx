import {
  KeyboardDownIcon,
  TimerIcon,
  TokenInfo,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useMemo, useRef, ChangeEvent } from "react";
import { IOType } from "../../constants/constants";
import { assetInfoStore } from "../../store/assetInfoStore";
import { Asset, isBitcoin } from "@gardenfi/orderbook";

type SwapInputProps = {
  type: IOType;
  amount: string;
  onChange: (amount: string) => void;
  asset?: Asset;
  loading: boolean;
  price: string;
  error?: string;
};

export const SwapInput: FC<SwapInputProps> = ({
  type,
  amount,
  asset,
  onChange,
  loading,
  price,
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setOpenAssetSelector, chains } = assetInfoStore();

  const network = useMemo(() => {
    if (!chains || (asset && isBitcoin(asset.chain))) return;
    if (!asset) return;
    return chains && chains[asset.chain];
  }, [asset, chains]);

  const label = type === IOType.input ? "Send" : "Receive";

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
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
              {Number(price) ? `~${price} USD` : ""}
            </Typography>
          </div>
          {type === IOType.input && error && (
            <Typography size="h5" weight="medium">
              <div className="text-red-500">{error}</div>
            </Typography>
          )}
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
          {loading ? (
            <div className="text-mid-grey">loading...</div>
          ) : (
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
          )}
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
