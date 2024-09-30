import { KeyboardDownIcon, TimerIcon, Typography } from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { SupportedAssets } from "../../constants/constants";
import { AssetSelector } from "./AssetSelector";

type SwapInputProps = {
  type: "Send" | "Receive";
  amount: string;
  fadeOutClass: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  setIsAssetSelectorVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SwapInput: FC<SwapInputProps> = ({
  type,
  amount,
  fadeOutClass,
  onChange,
  setIsAssetSelectorVisible,
}) => {
  const [asset, setAsset] = useState(
    type === "Send" ? SupportedAssets.BTC : SupportedAssets.WBTC,
  );
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  const handleChange = (
    input: string,
    maxDecimals: number,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
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
      if (decimals > maxDecimals && parts[1]) {
        // Trim decimals to only keep the maximum amount..
        setInput(parts[0] + "." + parts[1].slice(0, maxDecimals));
      } else {
        // Otherwise, just set the input.
        setInput(input);
      }
      return;
    }
    // If it's an empty string, just set the input.
    else if (input.length === 0) {
      setInput(input);
    }
    // If the last character is not a numerical digit or a dot, and the string
    // is not empty, do nothing and return.
    else {
      return;
    }
  };

  const handleShowAssetSelector = (show: boolean) => {
    setShowAssetSelector(show);
    setIsAssetSelectorVisible(show);
  };

  return (
    <>
      <AssetSelector
        visible={showAssetSelector}
        hide={() => handleShowAssetSelector(false)}
        setAsset={setAsset}
      />
      <div
        className={`flex flex-col gap-2 bg-white rounded-2xl p-4 ${fadeOutClass}`}
      >
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Typography size="h5" weight="bold">
              {type}
            </Typography>
            <Typography size="h5" weight="medium">
              ~224.51 USD
            </Typography>
          </div>
          {type === "Receive" && (
            <div className="flex gap-1 items-center">
              <TimerIcon className="h-4" />
              <Typography size="h5" weight="medium">
                ~2m 30s
              </Typography>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <Typography size="h2" weight="bold">
            <input
              // TODO: Check why the placeholder is not working
              className="flex-grow outline-none placeholder:text-mid-grey"
              type="text"
              value={amount}
              placeholder="0.0"
              onChange={(e) => handleChange(e.target.value, 8, onChange)}
            />
          </Typography>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleShowAssetSelector(true)}
          >
            <Typography size="h2" weight="medium">
              {asset.ticker}
            </Typography>
            {asset.icon}
            <KeyboardDownIcon />
          </div>
        </div>
      </div>
    </>
  );
};
