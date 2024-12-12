import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { useCallback, useMemo } from "react";
import { SwapInfo } from "../../../common/SwapInfo";
import { getTrimmedAddress } from "../../../utils/getTrimmedAddress";
import { swapStore } from "../../../store/swapStore";
import { formatAmount, getAssetFromSwap } from "../../../utils/utils";
import BigNumber from "bignumber.js";
import { assetInfoStore } from "../../../store/assetInfoStore";
import QRCode from "react-qr-code";
import { OrderStatus } from "./OrderStatus";
import { OrderDetails } from "./OrderDetails";
import { isBitcoin } from "@gardenfi/orderbook";
import { CopyToClipboard } from "../../../common/CopyToClipboard";

export const SwapInProgress = () => {
  const { swapInProgress, closeSwapInProgress } = swapStore();
  const { assets } = assetInfoStore();
  const { order } = swapInProgress;

  const { depositAddress, inputAsset, outputAsset, btcAddress } =
    useMemo(() => {
      return {
        depositAddress:
          order && isBitcoin(order?.source_swap.chain)
            ? order.source_swap.swap_id
            : "",
        inputAsset: order && getAssetFromSwap(order.source_swap, assets),
        outputAsset: order && getAssetFromSwap(order.destination_swap, assets),
        btcAddress: order
          ? order.create_order.additional_data.bitcoin_optional_recipient
          : "",
      };
    }, [assets, order]);

  const { inputAmountPrice, outputAmountPrice, amountToFill, filledAmount } =
    useMemo(() => {
      return {
        inputAmountPrice: order
          ? new BigNumber(order.source_swap.amount)
              .dividedBy(10 ** (inputAsset?.decimals ?? 0))
              .multipliedBy(
                order.create_order.additional_data.input_token_price
              )
          : new BigNumber(0),
        outputAmountPrice: order
          ? new BigNumber(order.destination_swap.amount)
              .dividedBy(10 ** (outputAsset?.decimals ?? 0))
              .multipliedBy(
                order.create_order.additional_data.output_token_price
              )
          : new BigNumber(0),
        amountToFill: order
          ? Number(
              new BigNumber(order.source_swap.amount)
                .dividedBy(10 ** (inputAsset?.decimals ?? 0))
                .toFixed(inputAsset?.decimals ?? 0)
            )
          : 0,
        filledAmount: order
          ? Number(
              new BigNumber(order.source_swap.filled_amount)
                .dividedBy(10 ** (inputAsset?.decimals ?? 0))
                .toFixed(inputAsset?.decimals ?? 0)
            )
          : 0,
      };
    }, [inputAsset, order, outputAsset]);

  const fees = inputAmountPrice.minus(outputAmountPrice).toFixed(3);

  const goBack = useCallback(
    () => closeSwapInProgress(),
    [closeSwapInProgress]
  );

  return order ? (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex justify-between items-center p-1">
        <Typography size="h4" weight="bold">
          Swap progress
        </Typography>
        <CloseIcon className="w-3 h-3 m-1 cursor-pointer" onClick={goBack} />
      </div>
      <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
        <Typography size="h5" weight="bold">
          Transaction
        </Typography>
        {inputAsset && outputAsset && (
          <SwapInfo
            sendAsset={inputAsset}
            receiveAsset={outputAsset}
            sendAmount={formatAmount(
              order.source_swap.amount,
              inputAsset.decimals
            )}
            receiveAmount={formatAmount(
              order.destination_swap.amount,
              outputAsset.decimals
            )}
          />
        )}
      </div>
      {inputAsset && isBitcoin(inputAsset.chain) && (
        <div className="flex justify-between bg-white rounded-2xl p-4">
          <div className="flex flex-col gap-2">
            <Typography size="h5" weight="bold">
              Deposit address
            </Typography>
            <div className="flex gap-2 items-center">
              <Typography size="h3" weight="bold">
                {getTrimmedAddress(depositAddress, 8, 6)}
              </Typography>
              <CopyToClipboard text={depositAddress} />
            </div>
          </div>
          <QRCode value={depositAddress} size={48} fgColor="#554B6A" />
        </div>
      )}
      <OrderStatus order={order} />
      <OrderDetails
        fees={fees}
        filledAmount={filledAmount}
        amountToFill={amountToFill}
        btcAddress={btcAddress}
      />
    </div>
  ) : (
    <></>
  );
};
