import { OrderStatus, ParseOrderStatus } from "@gardenfi/core";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useMemo } from "react";
import { blockNumberStore } from "../store/blockNumberStore";
import { assetInfoStore } from "../store/assetInfoStore";
import { getAssetFromSwap } from "../utils/utils";
import orderInProgressStore from "../store/orderInProgressStore";
import pendingOrdersStore from "../store/pendingOrdersStore";
import { Toast } from "../components/toast/Toast";

export enum SimplifiedOrderStatus {
  orderCreated = "Order created",
  detectingDeposit = "Detecting deposit",
  depositDetected = "Deposit detected",
  depositConfirmed = "Deposit confirmed",
  redeeming = "Redeeming ",
  redeemed = "Redeemed ",
  swapCompleted = "Swap completed",
  Refunded = "Refund completed",
  AwaitingRefund = "Awaiting refund",
  Expired = "Expired",
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
  readonly [key in 1 | 2 | 3 | 4]?: Status;
};

export const useOrderStatus = () => {
  const { orderBook } = useGarden();
  const { fetchAndSetBlockNumbers } = blockNumberStore();
  const { assets } = assetInfoStore();
  const { order: orderInProgress, setOrder } = orderInProgressStore();
  const { pendingOrders } = pendingOrdersStore();

  const outputAsset =
    orderInProgress &&
    getAssetFromSwap(orderInProgress.destination_swap, assets);

  const confirmationsString = useMemo(() => {
    return orderInProgress &&
      orderInProgress.status === OrderStatus.InitiateDetected
      ? "0" + "/" + "1"
      : "";
  }, [orderInProgress]);

  const viewableStatus =
    (orderInProgress?.status && STATUS_MAPPING[orderInProgress?.status]) ||
    null;

  const orderProgress: OrderProgress | undefined = useMemo(() => {
    switch (orderInProgress?.status) {
      case OrderStatus.Created:
        return {
          1: { title: SimplifiedOrderStatus.orderCreated, status: "completed" },
          2: {
            title: SimplifiedOrderStatus.detectingDeposit,
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
            title: SimplifiedOrderStatus.detectingDeposit,
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
        if (!orderInProgress.source_swap.refund_tx_hash) {
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
      case OrderStatus.Expired:
        return {
          1: {
            title: SimplifiedOrderStatus.orderCreated,
            status: "completed",
          },
          2: {
            title: SimplifiedOrderStatus.Expired,
            status: "cancel",
          },
        };
      default:
        return undefined;
    }
  }, [orderInProgress, outputAsset?.symbol]);

  useEffect(() => {
    if (!orderInProgress) return;

    // Check if order is in pending orders
    if (pendingOrders.length) {
      const orderFromPending = pendingOrders.find(
        (o) =>
          orderInProgress.create_order.create_id === o.create_order.create_id
      );
      if (orderFromPending) {
        setOrder(orderFromPending);
        return;
      }
    }

    // Skip fetching for completed orders
    const completedStatuses = [
      OrderStatus.RedeemDetected,
      OrderStatus.Redeemed,
      OrderStatus.CounterPartyRedeemDetected,
      OrderStatus.CounterPartyRedeemed,
      OrderStatus.Completed,
    ];

    if (completedStatuses.includes(orderInProgress.status)) return;

    // Fetch order from orderbook
    const fetchOrder = async () => {
      if (!orderBook) return;
      const blockNumbers = await fetchAndSetBlockNumbers();
      if (!blockNumbers) return;

      const orderFromOrderbook = await orderBook.getOrder(
        orderInProgress.create_order.create_id,
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

      if (completedStatuses.includes(status)) {
        const inputAsset = getAssetFromSwap(o.source_swap, assets);
        const outputAsset = getAssetFromSwap(o.destination_swap, assets);
        if (!inputAsset || !outputAsset) return;

        Toast.success(
          `Successfully swapped ${inputAsset.symbol} to ${outputAsset.symbol}`
        );
      }
    };

    fetchOrder();
  }, [
    pendingOrders,
    orderInProgress,
    setOrder,
    orderBook,
    fetchAndSetBlockNumbers,
    assets,
  ]);

  return {
    orderProgress,
    viewableStatus,
    confirmationsString,
  };
};
