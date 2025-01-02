import { OrderStatus, ParseOrderStatus } from "@gardenfi/core";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useMemo, useState } from "react";
import { blockNumberStore } from "../store/blockNumberStore";
import { assetInfoStore } from "../store/assetInfoStore";
import { getAssetFromSwap } from "../utils/utils";
import { mergeOrders } from "../utils/mergeOrder";
import { ordersStore } from "../store/newOrdersStore";

export enum SimplifiedOrderStatus {
  orderCreated = "Order created",
  awaitingDeposit = "Awaiting deposit",
  depositDetected = "Deposit detected",
  depositConfirmed = "Deposit confirmed",
  redeeming = "Redeeming ",
  redeemed = "Redeemed ",
  swapCompleted = "Swap completed",
}

type Status = {
  title: string;
  status: "completed" | "inProgress" | "pending";
};

export type OrderProgress = {
  readonly [key in 1 | 2 | 3 | 4]: Status;
};

export const useOrderStatus = () => {
  const [status, setStatus] = useState<OrderStatus>();
  const { orderBook } = useGarden();
  const { fetchAndSetBlockNumbers, blockNumbers } = blockNumberStore();
  const { assets } = assetInfoStore();
  const { orderInProgress: order, setOrderInProgress } = ordersStore();

  const outputAsset = order && getAssetFromSwap(order.destination_swap, assets);
  const initBlockNumber = Number(order?.source_swap.initiate_block_number);

  const confirmationsString = useMemo(() => {
    return order && status === OrderStatus.InitiateDetected && blockNumbers
      ? " (" +
          Math.abs(
            initBlockNumber
              ? blockNumbers[order.source_swap.chain] - initBlockNumber
              : 0
          ) +
          "/" +
          order.source_swap.required_confirmations +
          ")"
      : "";
  }, [blockNumbers, order, initBlockNumber, status]);

  const orderProgress: OrderProgress = useMemo(() => {
    switch (status) {
      case OrderStatus.Created:
        return {
          1: { title: SimplifiedOrderStatus.orderCreated, status: "completed" },
          2: {
            title: SimplifiedOrderStatus.awaitingDeposit,
            status: "pending",
          },
          3: {
            title: SimplifiedOrderStatus.redeeming + outputAsset?.symbol,
            status: "pending",
          },
          4: {
            title: SimplifiedOrderStatus.swapCompleted,
            status: "pending",
          },
        };
      case OrderStatus.Matched:
        return {
          1: { title: SimplifiedOrderStatus.orderCreated, status: "completed" },
          2: {
            title: SimplifiedOrderStatus.awaitingDeposit,
            status: "inProgress",
          },
          3: {
            title: SimplifiedOrderStatus.redeeming + outputAsset?.symbol,
            status: "pending",
          },
          4: {
            title: SimplifiedOrderStatus.swapCompleted,
            status: "pending",
          },
        };
      case OrderStatus.InitiateDetected:
        return {
          1: {
            title: SimplifiedOrderStatus.orderCreated,
            status: "completed",
          },
          2: {
            title: SimplifiedOrderStatus.depositDetected + confirmationsString,
            status: "inProgress",
          },
          3: {
            title: SimplifiedOrderStatus.redeeming + outputAsset?.symbol,
            status: "pending",
          },
          4: {
            title: SimplifiedOrderStatus.swapCompleted,
            status: "pending",
          },
        };
      case OrderStatus.Initiated:
        return {
          1: {
            title: SimplifiedOrderStatus.orderCreated,
            status: "completed",
          },
          2: {
            title: SimplifiedOrderStatus.depositConfirmed,
            status: "completed",
          },
          3: {
            title: SimplifiedOrderStatus.redeeming + outputAsset?.symbol,
            status: "inProgress",
          },
          4: {
            title: SimplifiedOrderStatus.swapCompleted,
            status: "pending",
          },
        };
      case OrderStatus.CounterPartyInitiateDetected:
      case OrderStatus.CounterPartyInitiated:
        return {
          1: {
            title: SimplifiedOrderStatus.orderCreated,
            status: "completed",
          },
          2: {
            title: SimplifiedOrderStatus.depositConfirmed,
            status: "completed",
          },
          3: {
            title: SimplifiedOrderStatus.redeeming + outputAsset?.symbol,
            status: "inProgress",
          },
          4: {
            title: SimplifiedOrderStatus.swapCompleted,
            status: "pending",
          },
        };
      case OrderStatus.RedeemDetected:
      case OrderStatus.Redeemed:
      case OrderStatus.CounterPartyRedeemDetected:
      case OrderStatus.CounterPartyRedeemed:
        return {
          1: {
            title: SimplifiedOrderStatus.orderCreated,
            status: "completed",
          },
          2: {
            title: SimplifiedOrderStatus.depositConfirmed,
            status: "completed",
          },
          3: {
            title: SimplifiedOrderStatus.redeemed + outputAsset?.symbol,
            status: "completed",
          },
          4: {
            title: SimplifiedOrderStatus.swapCompleted,
            status: "completed",
          },
        };
      default:
        return {
          1: { title: "", status: "pending" },
          2: { title: "", status: "pending" },
          3: { title: "", status: "pending" },
          4: { title: "", status: "pending" },
        };
    }
  }, [confirmationsString, outputAsset?.symbol, status]);

  useEffect(() => {
    // Don't start fetching if already redeemed
    if (
      status === OrderStatus.Redeemed ||
      status === OrderStatus.CounterPartyRedeemDetected ||
      status === OrderStatus.CounterPartyRedeemed ||
      status === OrderStatus.Completed
    )
      return;

    fetchAndSetBlockNumbers();
    const interval = setInterval(() => {
      console.log("fetching block numbers");
      fetchAndSetBlockNumbers();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAndSetBlockNumbers, status]);

  useEffect(() => {
    if (!orderBook || !blockNumbers || !order) return;

    // we are not using setInterval
    // fetchOrder is called when blockNumbers are updated which are in a interval
    const fetchOrder = async () => {
      if (!order?.create_order.create_id) return;
      const o = await orderBook.getOrder(order.create_order.create_id, true);
      if (o.error) return;

      const { source_swap, destination_swap } = o.val;
      const sourceBlockNumber = blockNumbers[source_swap.chain];
      const destinationBlockNumber = blockNumbers[destination_swap.chain];
      if (sourceBlockNumber && destinationBlockNumber) {
        const _status = ParseOrderStatus(
          o.val,
          sourceBlockNumber,
          destinationBlockNumber
        );
        setStatus(_status);
        setOrderInProgress({
          ...mergeOrders(order, o.val),
          status: _status,
        });
      }
    };

    fetchOrder();
  }, [orderBook, setOrderInProgress, blockNumbers]);

  return {
    status,
    orderProgress,
  };
};
