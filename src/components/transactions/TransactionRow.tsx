import { FC, useId, useMemo, useState } from "react";
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
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { Tooltip } from "../../common/Tooltip";

type TransactionProps = {
  order: MatchedOrder;
  status?: OrderStatus;
};

enum StatusLabel {
  Completed = "Completed",
  Pending = "In progress...",
  Expired = "Expired",
  ShouldInitiate = "Awaiting deposit",
  InitiateDetected = "Deposit detected (0/1)",
  Initiated = "Deposit detected",
  Redeeming = "Redeeming",
}

const getOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Matched:
      return StatusLabel.ShouldInitiate;
    case OrderStatus.DeadLineExceeded:
      return StatusLabel.Expired;
    case OrderStatus.InitiateDetected:
      return StatusLabel.InitiateDetected;
    case OrderStatus.Initiated:
      return StatusLabel.Initiated;
    case OrderStatus.CounterPartyInitiateDetected:
    case OrderStatus.CounterPartyInitiated:
      return StatusLabel.Redeeming;
    case OrderStatus.Redeemed:
    case OrderStatus.RedeemDetected:
    case OrderStatus.Refunded:
    case OrderStatus.RefundDetected:
    case OrderStatus.CounterPartyRedeemed:
    case OrderStatus.CounterPartyRedeemDetected:
      return StatusLabel.Completed;
    default:
      return StatusLabel.Pending;
  }
};

export const TransactionRow: FC<TransactionProps> = ({ order, status }) => {
  const [idTooltipContent, setIdTooltipContent] = useState("Copy");
  const idTooltip = useId();
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

  const handleIdClick = () => {
    navigator.clipboard.writeText(create_order.create_id);
    setIdTooltipContent("Copied");

    setTimeout(() => {
      setIdTooltipContent("Copy");
    }, 2000);
  };

  if (!sendAsset || !receiveAsset) return null;

  return (
    <div className={`flex flex-col gap-1 pb-4 ${statusLabel === StatusLabel.Completed ? "opacity-50" : ""}`}>
      <Typography
        size="h5"
        className="bg-white/50 w-fit p-1 px-2 rounded-full cursor-pointer mb-1"
        onClick={handleIdClick}
        data-tooltip-id={idTooltip}
      >
        {getTrimmedAddress(create_order.create_id, 4, 3)}
      </Typography>
      <Tooltip id={idTooltip} place="top" content={idTooltipContent} />
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
