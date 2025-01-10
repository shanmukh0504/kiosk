import {
  KeyboardDownIcon,
  TimerIcon,
  TokenInfo,
  Typography,
  WalletIcon,
} from "@gardenfi/garden-book";
import { FC, useMemo, useRef, ChangeEvent } from "react";
import { IOType } from "../../constants/constants";
import { assetInfoStore } from "../../store/assetInfoStore";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { modalNames, modalStore } from "../../store/modalStore";
import { ScaleYIn } from "../../common/ScaleY";

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
  // const [triggerPriceAnimation, setTriggerPriceAnimation] = useState(false);
  // const [triggerBalanceAnimation, setTriggerBalanceAnimation] = useState(false);
  // const [triggerTimeEstimateAnimation, setTriggerTimeEstimateAnimation] = useState(false);
  // const [triggerAmountAnimation, setTriggerAmountAnimation] = useState(false);
  // const [isInFocus, setIsInFocus] = useState(false);

  const network = useMemo(() => {
    if (!chains || (asset && isBitcoin(asset.chain))) return;
    if (!asset) return;
    return chains && chains[asset.chain];
  }, [asset, chains]);

  const label = type === IOType.input ? "Send" : "Receive";

  // useEffect(() => {
  //   if (amount && amount !== '0.0') {
  //     setTriggerAmountAnimation(false);
  //     setTimeout(() => setTriggerAmountAnimation(true), 0);
  //   }
  // }, [amount]);

  // useEffect(() => {
  //   if (price) {
  //     setTriggerPriceAnimation(false);
  //     setTimeout(() => setTriggerPriceAnimation(true), 0);
  //   }
  // }, [price]);

  // useEffect(() => {
  //   if (balance !== undefined) {
  //     setTriggerBalanceAnimation(false);
  //     setTimeout(() => setTriggerBalanceAnimation(true), 0);
  //   }
  // }, [balance]);

  // useEffect(() => {
  //   if (timeEstimate) {
  //     setTriggerTimeEstimateAnimation(false);
  //     setTimeout(() => setTriggerTimeEstimateAnimation(true), 0);
  //   }
  // }, [timeEstimate]);

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
            {Number(price) !== 0 && (
              <ScaleYIn triggerAnimation={false}>
                <Typography
                  size="h5"
                  weight="medium"
                  className="text-mid-grey absolute "
                >
                  ${price}
                </Typography>
              </ScaleYIn>
            )}
          </div>
          {type === IOType.input &&
            (error ? (
              <Typography size="h5" weight="medium">
                <div className="text-red-500">{error}</div>
              </Typography>
            ) : balance !== undefined ? (
              <ScaleYIn triggerAnimation={false}>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={handleBalanceClick}
                >
                  <WalletIcon className="h-2.5 w-2.5" />
                  <Typography size="h5" weight="medium">
                    {balance}
                  </Typography>
                </div>
              </ScaleYIn>
            ) : (
              <></>
            ))}
          {type === IOType.output &&
            (error ? (
              <Typography size="h5" weight="medium">
                <div className="text-red-500">{error}</div>
              </Typography>
            ) : (
              timeEstimate && (
                <ScaleYIn triggerAnimation={false}>
                  <div className="flex gap-1 items-center">
                    <TimerIcon className="h-4" />
                    <Typography size="h5" weight="medium">
                      {timeEstimate}
                    </Typography>
                  </div>
                </ScaleYIn>
              )
            ))}
        </div>
        <div className="flex justify-between h-6">
          {loading ? (
            // The "loading..." Text feels like a glitch as it fetches fast
            <div className="text-mid-grey"></div>
          ) : (
            <Typography
              size={"h3"}
              breakpoints={{
                sm: "h2",
              }}
              weight="bold"
            >
              <div className="relative max-w-[150px] md:max-w-[200px]">
                <ScaleYIn triggerAnimation={false}>
                  <input
                    ref={inputRef}
                    className="w-full outline-none"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    // onFocus={() => setIsInFocus(true)}
                    // onBlur={() => {
                    //   setIsInFocus(false);
                    //   setTriggerAmountAnimation(false);
                    // }}
                  />
                </ScaleYIn>
                {/* Placeholder as a separate element */}
                {/* {(!amount) && (
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-mid-grey pointer-events-none">
                    0.0
                  </span>
                )} */}
              </div>
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
