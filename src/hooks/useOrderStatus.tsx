import { OrderStatus, ParseOrderStatus } from "@gardenfi/core";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useMemo } from "react";
import { blockNumberStore } from "../store/blockNumberStore";
import { assetInfoStore } from "../store/assetInfoStore";
import { getAssetFromSwap } from "../utils/utils";
import orderInProgressStore from "../store/orderInProgressStore";
import pendingOrdersStore from "../store/pendingOrdersStore";

export enum SimplifiedOrderStatus {
  orderCreated = "Order created",
  awaitingDeposit = "Awaiting deposit",
  depositDetected = "Deposit detected",
  depositConfirmed = "Deposit confirmed",
  redeeming = "Redeeming ",
  redeemed = "Redeemed ",
  swapCompleted = "Swap completed",
  Refunded = "Refund completed",
  AwaitingRefund = "Awaiting refund",
}

export const STATUS_MAPPING: Record<string, SimplifiedOrderStatus> = {
  RefundDetected: SimplifiedOrderStatus.Refunded,
  CounterPartyRefundDetected: SimplifiedOrderStatus.AwaitingRefund,
  CounterPartyRefunded: SimplifiedOrderStatus.AwaitingRefund,
  Refunded: SimplifiedOrderStatus.Refunded,
};

type Status = {
  title: string;
  status: "completed" | "inProgress" | "pending" | "cancel";
};

export type OrderProgress = {
  readonly [key in 1 | 2 | 3 | 4]: Status;
};

export const useOrderStatus = () => {
  const { orderBook } = useGarden();
  const { blockNumbers } = blockNumberStore();
  const { assets } = assetInfoStore();
  const { order, setOrder } = orderInProgressStore();
  const { pendingOrders } = pendingOrdersStore();

  const outputAsset = order && getAssetFromSwap(order.destination_swap, assets);

  const confirmationsString = useMemo(() => {
    return order && order.status === OrderStatus.InitiateDetected
      ? "0" + "/" + "1"
      : "";
  }, [order]);

  const viewableStatus =
    (order?.status && STATUS_MAPPING[order?.status]) || null;

  const orderProgress: OrderProgress | undefined = useMemo(() => {
    switch (order?.status) {
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
            title: SimplifiedOrderStatus.depositDetected,
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
      case OrderStatus.CounterPartyRefundDetected:
      case OrderStatus.CounterPartyRefunded:
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
            title: SimplifiedOrderStatus.AwaitingRefund,
            status: "inProgress",
          },
          4: {
            title: SimplifiedOrderStatus.Refunded,
            status: "pending",
          },
        };
      case OrderStatus.RefundDetected:
      case OrderStatus.Refunded:
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
            status: "cancel",
          },
          4: {
            title: SimplifiedOrderStatus.Refunded,
            status: "completed",
          },
        };
      case OrderStatus.RedeemDetected:
      case OrderStatus.Redeemed:
      case OrderStatus.CounterPartyRedeemDetected:
      case OrderStatus.CounterPartyRedeemed:
      case OrderStatus.Completed:
        if (!order.source_swap.refund_tx_hash) {
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
        } else {
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
              status: "cancel",
            },
            4: {
              title: SimplifiedOrderStatus.Refunded,
              status: "completed",
            },
          };
        }
      default:
        return undefined;
    }
  }, [order, outputAsset?.symbol]);

  useEffect(() => {
    if (!order) return;
    if (pendingOrders.length) {
      //check in pending orders and update status
      const orderFromPending = pendingOrders.find(
        (o) => order.create_order.create_id === o.create_order.create_id
      );
      if (orderFromPending) setOrder(orderFromPending);
    } else {
      //fetch from orderbook and set status
      if (
        [
          OrderStatus.RedeemDetected,
          OrderStatus.Redeemed,
          OrderStatus.CounterPartyRedeemDetected,
          OrderStatus.CounterPartyRedeemed,
          OrderStatus.Completed,
        ].includes(order.status)
      )
        return;

      const fetchOrder = async () => {
        if (!orderBook || !blockNumbers) return;
        const orderFromOrderbook = await orderBook.getOrder(
          order.create_order.create_id,
          true
        );
        if (!orderFromOrderbook.ok) return;
        const o = orderFromOrderbook.val;
        const status = ParseOrderStatus(
          o,
          blockNumbers[o.source_swap.chain],
          blockNumbers[o.destination_swap.chain]
        );
        setOrder({ ...o, status });
      };
      fetchOrder();
    }
  }, [pendingOrders, order, setOrder, orderBook, blockNumbers]);

  return {
    orderProgress,
    viewableStatus,
    confirmationsString,
  };
};
