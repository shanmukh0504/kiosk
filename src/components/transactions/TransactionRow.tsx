import { FC, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { Order, OrderStatus } from "@gardenfi/orderbook";
import {
  formatAmount,
  getAssetFromSwap,
  getDayDifference,
} from "../../utils/utils";
import { assetInfoStore } from "../../store/assetInfoStore";
import { modalNames, modalStore } from "../../store/modalStore";
import orderInProgressStore from "../../store/orderInProgressStore";
import { BTC } from "../../store/swapStore";

type TransactionProps = {
  order: Order;
  status?: OrderStatus;
  isLast: boolean;
  isFirst: boolean;
  onClick?: () => void;
};

enum StatusLabel {
  Completed = "Completed",
  Pending = "In progress...",
  Expired = "Expired",
  ShouldInitiate = "Detecting deposit",
  InitiateDetected = "Deposit detected (0/1)",
  Initiated = "Deposit detected",
  Redeeming = "Redeeming",
}

const getOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Created:
      return StatusLabel.ShouldInitiate;
    case OrderStatus.Expired:
      return StatusLabel.Expired;
    case OrderStatus.InitiateDetected:
      return StatusLabel.InitiateDetected;
    case OrderStatus.Initiated:
    case OrderStatus.AwaitingRedeem:
      return StatusLabel.Redeeming;
    case OrderStatus.Redeemed:
    case OrderStatus.RedeemDetected:
    case OrderStatus.Refunded:
    case OrderStatus.RefundDetected:
      return StatusLabel.Completed;
    default:
      return StatusLabel.Pending;
  }
};

export const TransactionRow: FC<TransactionProps> = ({
  order,
  status,
  isLast,
  onClick,
  isFirst,
}) => {
  const { source_swap, destination_swap } = order;
  const { allAssets } = assetInfoStore();
  const { setOrder, setIsOpen } = orderInProgressStore();
  const { setCloseModal } = modalStore();
  // const { evmInitiate } = useGarden();

  const sendAsset = useMemo(
    () => getAssetFromSwap(source_swap, allAssets),
    [source_swap, allAssets]
  );
  const receiveAsset = useMemo(
    () => getAssetFromSwap(destination_swap, allAssets),
    [destination_swap, allAssets]
  );
  const statusLabel = useMemo(
    () => status && getOrderStatusLabel(status),
    [status]
  );
  const sendAmount = useMemo(
    () =>
      sendAsset &&
      formatAmount(
        order.source_swap.amount,
        sendAsset?.decimals ?? 0,
        Math.min(sendAsset.decimals, BTC.decimals)
      ),
    [order.source_swap.amount, sendAsset]
  );
  const receiveAmount = useMemo(
    () =>
      receiveAsset &&
      formatAmount(
        order.destination_swap.amount,
        receiveAsset?.decimals ?? 0,
        Math.min(receiveAsset.decimals, BTC.decimals)
      ),
    [order.destination_swap.amount, receiveAsset]
  );
  const dayDifference = useMemo(
    () => getDayDifference(order.created_at),
    [order.created_at]
  );

  const handleTransactionClick = async () => {
    if (statusLabel !== StatusLabel.Expired && status) {
      setOrder({ ...order, status: status });
      onClick?.();
      setIsOpen(true);
      setCloseModal(modalNames.transactions);
    }

    // if (!isBitcoin(order.source_swap.chain) && status === OrderStatus.Matched) {
    //   if (!evmInitiate) return;
    //   const res = await evmInitiate(order);
    //   if (res.error) {
    //     console.error("failed to initiate swap ❌", res.error);
    //   }
    // }
  };

  if (!sendAsset || !receiveAsset) return null;

  return (
    <div>
      {!isFirst && <div className="h-px w-full bg-white/50"></div>}
      <div
        className={`flex flex-col gap-1 p-4 ${isLast ? "rounded-b-2xl" : ""} ${
          statusLabel !== StatusLabel.Expired
            ? "cursor-pointer hover:bg-white/50"
            : ""
        }`}
        onClick={handleTransactionClick}
      >
        <div className={`flex flex-col gap-1`}>
          {sendAmount && receiveAmount && (
            <SwapInfo
              sendAsset={sendAsset}
              receiveAsset={receiveAsset}
              sendAmount={sendAmount}
              receiveAmount={receiveAmount}
            />
          )}
          <div className="flex justify-between">
            <Typography size="h5" weight="regular">
              {statusLabel}
            </Typography>
            <Typography size="h5" weight="regular">
              {dayDifference}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
