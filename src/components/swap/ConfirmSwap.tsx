import {
  ArrowLeftIcon,
  Button,
  CheckIcon,
  CopyIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState } from "react";
import { SwapInfo } from "../../common/SwapInfo";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { swapStore } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";

export const ConfirmSwap = () => {
  const [copied, setCopied] = useState(false);
  const {
    inputAsset,
    outputAsset,
    inputAmount,
    outputAmount,
    btcAddress,
    confirmSwap,
    clearOrder,
  } = swapStore();
  const isRecoveryAddress = inputAsset && isBitcoin(inputAsset?.chain);
  const depositAddress = confirmSwap.order
    ? confirmSwap.order.source_swap.swap_id
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depositAddress);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const goBack = () => clearOrder();

  return confirmSwap.order ? (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Transaction
        </Typography>
        {inputAsset && outputAsset && (
          <SwapInfo
            sendAsset={inputAsset}
            receiveAsset={outputAsset}
            sendAmount={inputAmount}
            receiveAmount={outputAmount}
          />
        )}
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Deposit address
        </Typography>
        <div className="flex justify-between items-center">
          <Typography size="h3" weight="bold">
            {getTrimmedAddress(depositAddress)}
          </Typography>
          {/* TODO: Use a Lottie animation to make this smoother */}
          {copied ? (
            <CheckIcon className="w-6 h-3" />
          ) : (
            <CopyIcon
              className="w-6 h-5 cursor-pointer"
              onClick={copyToClipboard}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-white/50 rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Transaction details
        </Typography>
        <div className="flex justify-between">
          <Typography size="h4" weight="medium">
            Fees
          </Typography>
          <div className="flex gap-5">
            <Typography size="h4" weight="medium">
              0.00101204 BTC
            </Typography>
            <Typography size="h4" weight="medium">
              $56.56
            </Typography>
          </div>
        </div>
        <div className="flex justify-between">
          <Typography size="h4" weight="medium">
            {isRecoveryAddress ? "Recovery" : "Receive"} address
          </Typography>
          <Typography size="h4" weight="medium">
            {getTrimmedAddress(btcAddress)}
          </Typography>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="disabled" size="lg" className="w-full">
          Awaiting Deposit
        </Button>
        <div
          className="flex items-center bg-dark-grey rounded-2xl p-3 cursor-pointer"
          onClick={goBack}
        >
          <ArrowLeftIcon className="w-6 h-[14px] fill-white" />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
