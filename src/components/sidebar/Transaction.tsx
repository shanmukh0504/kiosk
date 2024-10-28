import { FC, useState } from "react";
import { Button, Typography } from "@gardenfi/garden-book";
import { SwapInfo } from "../../common/SwapInfo";
import { isEVM, MatchedOrder } from "@gardenfi/orderbook";
import { getAssetFromSwap, getDayDifference } from "../../utils/utils";
import { OrderStatus } from "@gardenfi/core";
import { useGarden } from "@gardenfi/react-hooks";

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
    case OrderStatus.Refunded:
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
  const [isInitiating, setIsInitiating] = useState(false);

  const { evmInitiate } = useGarden();
  const { create_order, source_swap, destination_swap } = order;

  const sendAsset = getAssetFromSwap(source_swap);
  const receiveAsset = getAssetFromSwap(destination_swap);
  const statusLabel = status && getOrderStatusLabel(status);
  const shouldInitiate =
    isEVM(order.source_swap.chain) && status === OrderStatus.Matched;

  const handleInitiate = async () => {
    if (!evmInitiate) return;
    setIsInitiating(true);
    const res = await evmInitiate(order);
    if (res.ok) {
      console.log("Initiated");
      status = OrderStatus.InitiateDetected;
    } else {
      console.log("Failed to initiate");
    }
    setIsInitiating(false);
  };

  return sendAsset && receiveAsset ? (
    <div className="flex flex-col gap-1 pb-4">
      <SwapInfo
        sendAsset={sendAsset}
        receiveAsset={receiveAsset}
        sendAmount={create_order.source_amount}
        receiveAmount={create_order.destination_amount}
      />
      {shouldInitiate ? (
        <Button
          variant={isInitiating ? "disabled" : "primary"}
          onClick={handleInitiate}
          className={"my-3 w-10 ml-auto"}
        >
          {isInitiating ? "Initiating..." : "Initiate"}
        </Button>
      ) : (
        <div className="flex justify-between">
          <Typography size="h5" weight="medium">
            {statusLabel}
          </Typography>
          <Typography size="h5" weight="medium">
            {getDayDifference(create_order.updated_at)}
          </Typography>
        </div>
      )}
    </div>
  ) : null;
};
