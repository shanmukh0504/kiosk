import { FC, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { MatchedOrder } from "@gardenfi/orderbook";
import {
  formatAmount,
  getAssetFromSwap,
  getDayDifference,
} from "../../utils/utils";
import { OrderStatus } from "@gardenfi/core";
import { assetInfoStore } from "../../store/assetInfoStore";

type TransactionProps = {
  order: MatchedOrder;
  status?: OrderStatus;
};

enum StatusLabel {
  Completed = "Completed",
  Pending = "In progress...",
  Expired = "Expired",
  Initiate = "Awaiting initiate",
}

const getOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Redeemed:
    case OrderStatus.RedeemDetected:
    case OrderStatus.Refunded:
    case OrderStatus.RefundDetected:
    case OrderStatus.CounterPartyRedeemed:
    case OrderStatus.CounterPartyRedeemDetected:
      return StatusLabel.Completed;
    case OrderStatus.Matched:
      return StatusLabel.Initiate;
    case OrderStatus.DeadLineExceeded:
      return StatusLabel.Expired;
    default:
      return StatusLabel.Pending;
  }
};

export const Transaction: FC<TransactionProps> = ({ order, status }) => {
  const { create_order, source_swap, destination_swap } = order;
  const { assets } = assetInfoStore();

  const sendAsset = useMemo(
    () => getAssetFromSwap(source_swap, assets),
    [source_swap, assets]
  );
  const receiveAsset = useMemo(
    () => getAssetFromSwap(destination_swap, assets),
    [destination_swap, assets]
  );
  const statusLabel = useMemo(
    () => status && getOrderStatusLabel(status),
    [status]
  );
  const sendAmount = useMemo(
    () => formatAmount(create_order.source_amount, sendAsset?.decimals ?? 0),
    [create_order.source_amount, sendAsset?.decimals]
  );
  const receiveAmount = useMemo(
    () =>
      formatAmount(
        create_order.destination_amount,
        receiveAsset?.decimals ?? 0
      ),
    [create_order.destination_amount, receiveAsset?.decimals]
  );
  const dayDifference = useMemo(
    () => getDayDifference(create_order.updated_at),
    [create_order.updated_at]
  );

  if (!sendAsset || !receiveAsset) return null;

  return (
    <div className="flex flex-col gap-1 pb-4">
      <SwapInfo
        sendAsset={sendAsset}
        receiveAsset={receiveAsset}
        sendAmount={sendAmount}
        receiveAmount={receiveAmount}
      />
      <div className="flex justify-between">
        <Typography size="h5" weight="medium">
          {statusLabel}
        </Typography>
        <Typography size="h5" weight="medium">
          {dayDifference}
        </Typography>
      </div>
    </div>
  );
};
