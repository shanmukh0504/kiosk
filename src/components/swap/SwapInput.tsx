import {
  KeyboardDownIcon,
  TimerIcon,
  TokenInfo,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { Asset } from "../../constants/constants";
import { AssetSelector } from "./AssetSelector";

type SwapInputProps = {
  type: "Send" | "Receive";
  amount: string;
  asset: Asset;
  fadeOutClass: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  setAsset: React.Dispatch<React.SetStateAction<Asset>>;
  setFadeContents: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SwapInput: FC<SwapInputProps> = ({
  type,
  amount,
  asset,
  fadeOutClass,
  setAmount,
  setAsset,
  setFadeContents,
}) => {
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
    setFadeContents(show);
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
              onChange={(e) =>
                // TODO: Decide if we want to use asset.decimals here, e.g. if
                // the user is swapping ETH should we let them input 18
                // decimals?
                handleChange(e.target.value, asset.decimals, setAmount)
              }
            />
          </Typography>
          <TokenInfo
            symbol={asset.ticker}
            tokenLogo={asset.icon}
            onClick={() => handleShowAssetSelector(true)}
          />
        </div>
      </div>
    </>
  );
};
