import {
  KeyboardDownIcon,
  TimerIcon,
  TokenInfo,
  Typography,
  WalletIcon,
  ScaleY
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
  loading,
  price,
  error,
  balance,
  timeEstimate,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setOpenAssetSelector, chains } = assetInfoStore();
  const { setOpenModal } = modalStore();
  const [triggerPriceAnimation, setTriggerPriceAnimation] = useState(false);
  const [triggerBalanceAnimation, setTriggerBalanceAnimation] = useState(false);
  const [triggerTimeEstimateAnimation, setTriggerTimeEstimateAnimation] = useState(false);
  const [triggerAmountAnimation, setTriggerAmountAnimation] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (isInitialRender) {
      setTriggerAmountAnimation(true)
      setTimeout(() => setIsInitialRender(false), 0);
    }
  }, [isInitialRender]);

  useEffect(() => {
    if (!isInitialRender && amount) {
      setTriggerAmountAnimation(false);
      setTimeout(() => setTriggerAmountAnimation(true), 0);
    }
  }, [amount, isInitialRender]);

  useEffect(() => {
    if (price) {
      setTriggerPriceAnimation(false);
      setTimeout(() => setTriggerPriceAnimation(true), 0);
    }
  }, [price]);

  useEffect(() => {
    if (balance !== undefined) {
      setTriggerBalanceAnimation(false);
      setTimeout(() => setTriggerBalanceAnimation(true), 0);
    }
  }, [balance]);

  useEffect(() => {
    if (timeEstimate) {
      setTriggerTimeEstimateAnimation(false);
      setTimeout(() => setTriggerTimeEstimateAnimation(true), 0);
    }
  }, [timeEstimate]);

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
            <ScaleY triggerAnimation={triggerPriceAnimation}>
              <Typography size="h5" weight="medium" className="text-mid-grey absolute ">
                {Number(price) ? `$${price}` : ""}
              </Typography>
            </ScaleY>
          </div>
          {type === IOType.input &&
            (error ? (
              <Typography size="h5" weight="medium">
                <div className="text-red-500">{error}</div>
              </Typography>
            ) : balance !== undefined ? (

              <div className="flex items-center gap-1 cursor-pointer" onClick={handleBalanceClick}>
                <WalletIcon className="h-2.5 w-2.5" />
                <Typography size="h5" weight="medium">
                  {balance}
                </Typography>
              </div>
            ) : (
              <></>
            ))}
          {type === IOType.output && timeEstimate && (
            <ScaleY triggerAnimation={triggerTimeEstimateAnimation}>
              <div className="flex gap-1 items-center">
                <TimerIcon className="h-4" />
                <Typography size="h5" weight="medium">
                  {timeEstimate}
                </Typography>
              </div>
            </ScaleY>
          )}
        </div>
        <div className="flex justify-between h-6">
          {loading ? (
            <div className="text-mid-grey">loading...</div>
          ) : type === IOType.output ? (
            <ScaleY triggerAnimation={triggerAmountAnimation}>
              <Typography
                size={"h3"}
                breakpoints={{
                  sm: "h2",
                }}
                weight="bold"
              >
                <input
                  ref={inputRef}
                  className="max-w-[150px] outline-none placeholder:text-mid-grey"
                  type="text"
                  value={amount === "0" ? "" : amount}
                  placeholder="0.0"
                  onChange={handleAmountChange}
                />
              </Typography>
            </ScaleY>
          ) : (
            <Typography
              size={"h3"}
              breakpoints={{
                sm: "h2",
              }}
              weight="bold"
            >
              <input
                ref={inputRef}
                className="max-w-[150px] outline-none placeholder:text-mid-grey"
                type="text"
                value={amount === "0" ? "" : amount}
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
              className="flex items-center gap-1 cursor-pointer"
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
