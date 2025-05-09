import {
  KeyboardDownIcon,
  ScaleY,
  TimerIcon,
  TokenInfo,
  Typography,
  WalletIcon,
} from "@gardenfi/garden-book";
import { FC, useMemo, useRef, ChangeEvent, useState, useEffect } from "react";
import { IOType } from "../../constants/constants";
import { assetInfoStore } from "../../store/assetInfoStore";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { modalNames, modalStore } from "../../store/modalStore";

type SwapInputProps = {
  type: IOType;
  amount: string;
  onChange: (amount: string) => void;
  asset?: Asset;
  loading: boolean;
  price: string;
  error?: string;
  balance?: number;
  timeEstimate?: string;
};

export const SwapInput: FC<SwapInputProps> = ({
  type,
  amount,
  asset,
  onChange,
  price,
  error,
  balance,
  timeEstimate,
}) => {
  const [triggerAmountAnimation, setTriggerAmountAnimation] = useState(true);
  const [isInFocus, setIsInFocus] = useState(false);

  const { setOpenAssetSelector, chains } = assetInfoStore();
  const { setOpenModal } = modalStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const network = useMemo(() => {
    if (!chains || (asset && isBitcoin(asset.chain))) return;
    if (!asset) return;
    return chains && chains[asset.chain];
  }, [asset, chains]);

  const label = type === IOType.input ? "Send" : "Receive";

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const parts = input.split(".");
    if (input === "-") return;
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

  const handleBalanceClick = () => {
    if (type === IOType.input && balance) {
      const balanceStr = balance.toString();
      onChange(balanceStr);
    }
  };

  const handleOpenAssetSelector = () => {
    setOpenAssetSelector(type);
    setOpenModal(modalNames.assetList);
  };

  useEffect(() => {
    setTriggerAmountAnimation(true);
    const timer = setTimeout(() => setTriggerAmountAnimation(false), 500);
    return () => clearTimeout(timer);
  }, [amount]);

  return (
    <>
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Typography
              size="h5"
              weight="bold"
              onClick={() => inputRef.current!.focus()}
            >
              {label}
            </Typography>
            {amount && Number(price) !== 0 && (
              <Typography size="h5" weight="medium">
                <span className="text-mid-grey">~${price}</span>
              </Typography>
            )}
          </div>
          {type === IOType.input &&
            (error ? (
              <Typography size="h5" weight="medium" className="!text-red-500">
                {error}
              </Typography>
            ) : balance !== undefined ? (
              <div
                className="flex cursor-pointer items-center gap-1"
                onClick={handleBalanceClick}
              >
                <WalletIcon className="h-2.5 w-2.5" />
                <Typography size="h5" weight="medium">
                  {balance}
                </Typography>
              </div>
            ) : (
              <></>
            ))}
          {type === IOType.output &&
            (error ? (
              <Typography size="h5" weight="medium" className="!text-red-500">
                {error}
              </Typography>
            ) : (
              timeEstimate && (
                <div className="flex items-end gap-1">
                  <TimerIcon className="h-4" />
                  <Typography
                    size="h5"
                    weight="medium"
                    className="!leading-none"
                  >
                    {timeEstimate}
                  </Typography>
                </div>
              )
            ))}
        </div>
        <div className="flex h-6 justify-between sm:h-7">
          <Typography
            size={"h3"}
            breakpoints={{
              sm: "h2",
            }}
            weight="bold"
          >
            <div className="relative max-w-[150px] md:max-w-[200px]">
              <ScaleY triggerAnimation={triggerAmountAnimation && !isInFocus}>
                <input
                  ref={inputRef}
                  className="w-full outline-none"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onFocus={() => setIsInFocus(true)}
                  onBlur={() => {
                    setIsInFocus(false);
                  }}
                />
              </ScaleY>
              {/* Placeholder as a separate element to avoid scaleY animation on load */}
              {!amount && (
                <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 transform">
                  0
                </span>
              )}
            </div>
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
              className="flex cursor-pointer items-center gap-1"
              onClick={handleOpenAssetSelector}
            >
              <Typography
                size={"h3"}
                breakpoints={{
                  sm: "h2",
                }}
                weight="medium"
              >
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
