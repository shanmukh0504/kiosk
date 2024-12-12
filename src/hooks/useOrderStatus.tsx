import { OrderStatus, ParseOrderStatus } from "@gardenfi/core";
import { MatchedOrder } from "@gardenfi/orderbook";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect, useMemo, useState } from "react";
import { blockNumberStore } from "../store/blockNumberStore";

export enum SimplifiedOrderStatus {
  orderCreated = "Order created",
  detectingDeposit = "Detecting deposit",
  depositDetected = "Deposit detected",
  redeemingWBTC = "Redeeming ",
  swapCompleted = "Swap completed",
}

export const useOrderStatus = (_order: MatchedOrder | null) => {
  const [status, setStatus] = useState<OrderStatus>();
  const [order, setOrder] = useState(_order);
  const { orderBook } = useGarden();
  const { fetchAndSetBlockNumbers, blockNumbers } = blockNumberStore();

  const simplifiedStatus = useMemo(() => {
    if (!status) return;

    switch (status) {
      case OrderStatus.Created:
        return SimplifiedOrderStatus.orderCreated;
      case OrderStatus.Matched:
        return SimplifiedOrderStatus.detectingDeposit;
      case OrderStatus.InitiateDetected:
      case OrderStatus.Initiated:
        return SimplifiedOrderStatus.depositDetected;
      case OrderStatus.CounterPartyInitiateDetected:
      case OrderStatus.CounterPartyInitiated:
        return SimplifiedOrderStatus.redeemingWBTC;
      case OrderStatus.RedeemDetected:
      case OrderStatus.Redeemed:
      case OrderStatus.CounterPartyRedeemDetected:
      case OrderStatus.CounterPartyRedeemed:
        return SimplifiedOrderStatus.swapCompleted;
    }
  }, [status]);

  useEffect(() => {
    if (!orderBook) return;

    const fetchOrderAndBlockNumbers = async () => {
      await fetchAndSetBlockNumbers();
      const o = await orderBook.getOrder(
        order?.create_order.create_id ?? "",
        true
      );
      if (o.error) return;
      setOrder(o.val);
    };

    fetchOrderAndBlockNumbers();
    const intervalId = setInterval(fetchOrderAndBlockNumbers, 5000);

    return () => clearInterval(intervalId);
  }, [fetchAndSetBlockNumbers, order?.create_order.create_id, orderBook]);

  useEffect(() => {
    if (!order || !blockNumbers) return;
    const { source_swap, destination_swap } = order;
    const sourceBlockNumber = blockNumbers[source_swap.chain];
    const destinationBlockNumber = blockNumbers[destination_swap.chain];
    if (!sourceBlockNumber || !destinationBlockNumber) return;

    setStatus(
      ParseOrderStatus(order, sourceBlockNumber, destinationBlockNumber)
    );
  }, [blockNumbers, order]);

  return { status, simplifiedStatus };
};
