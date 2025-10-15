import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useMemo } from "react";
import { assetInfoStore } from "../store/assetInfoStore";
import { formatAmount, getAssetFromSwap } from "../utils/utils";
import orderInProgressStore from "../store/orderInProgressStore";
import pendingOrdersStore from "../store/pendingOrdersStore";
import { Toast } from "../components/toast/Toast";
import { OrderStatus, ParseOrderStatus } from "@gardenfi/orderbook";
import { BTC } from "../store/swapStore";

export enum SimplifiedOrderStatus {
  orderCreated = "Order created",
  detectingDeposit = "Detecting deposit",
  depositDetected = "Deposit detected",
  depositConfirmed = "Deposit confirmed",
  awaitingRedeem = "Awaiting redeem",
  redeeming = "Redeeming ",
  redeemed = "Redeemed ",
  swapCompleted = "Swap completed",
  refunded = "Refund completed",
  expired = "Expired",
}

export const STATUS_MAPPING: Record<string, SimplifiedOrderStatus> = {
  RefundDetected: SimplifiedOrderStatus.refunded,
  Refunded: SimplifiedOrderStatus.refunded,
  AwaitingRedeem: SimplifiedOrderStatus.awaitingRedeem,
  Expired: SimplifiedOrderStatus.expired,
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
      case OrderStatus.AwaitingRedeem:
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
              title: SimplifiedOrderStatus.refunded,
              status: "completed",
            },
          };
        }
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
            title: SimplifiedOrderStatus.refunded,
            status: "completed",
          },
        };
      case OrderStatus.Expired:
        return {
          1: {
            title: SimplifiedOrderStatus.orderCreated,
            status: "completed",
          },
          2: {
            title: SimplifiedOrderStatus.expired,
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
        (o) => orderInProgress.order_id === o.order_id
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
    ];

    if (completedStatuses.includes(orderInProgress.status)) return;

    // Fetch order from orderbook
    const fetchOrder = async () => {
      if (!orderBook) return;
      const orderFromOrderbook = await orderBook.getOrder(
        orderInProgress.order_id
      );

      if (!orderFromOrderbook.ok) return;

      const o = orderFromOrderbook.val;
      const status = ParseOrderStatus(o);

      setOrder({ ...o, status });

      if (completedStatuses.includes(status)) {
        const inputAsset = getAssetFromSwap(o.source_swap, assets);
        const outputAsset = getAssetFromSwap(o.destination_swap, assets);
        const inputAmount =
          inputAsset &&
          formatAmount(
            o.source_swap.amount,
            inputAsset.decimals,
            inputAsset.symbol.includes(BTC.symbol)
              ? inputAsset.decimals
              : undefined
          );
        const outputAmount =
          outputAsset &&
          formatAmount(
            o.destination_swap.amount,
            outputAsset.decimals,
            outputAsset.symbol.includes(BTC.symbol)
              ? outputAsset.decimals
              : undefined
          );
        if (!inputAsset || !outputAsset) return;

        Toast.success(
          `${inputAmount} ${inputAsset.symbol} swapped for ${outputAmount} ${outputAsset.symbol}`
        );
      }
    };

    fetchOrder();
  }, [pendingOrders, orderInProgress, setOrder, orderBook, assets]);

  return {
    orderProgress,
    viewableStatus,
    confirmationsString,
  };
};
