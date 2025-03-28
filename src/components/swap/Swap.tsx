import { useEffect, useState } from "react";
import { SwapInProgress } from "./swapInProgress/SwapInProgress";
import { CreateSwap } from "./CreateSwap";
import { Toast, ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useGarden } from "@gardenfi/react-hooks";
import { MatchedOrder } from "@gardenfi/orderbook";
import {
  formatAmount,
  getAssetFromSwap,
  getQueryParams,
  isCurrentRoute,
} from "../../utils/utils";
import { OrderActions, OrderStatus } from "@gardenfi/core";
import { ordersStore } from "../../store/ordersStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SwapInProgressSkeleton } from "./swapInProgress/SwapInProgressSkeleton";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { INTERNAL_ROUTES } from "../../constants/constants";

export const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const { address } = useEVMWallet();

  const { fetchAndSetStrategies, assets } = assetInfoStore();
  const { quote, garden } = useGarden();
  const { orderInProgress, updateOrder } = ordersStore();

  const orderId = getQueryParams(searchParams).orderId ?? "";

  useEffect(() => {
    if (!quote) return;
    fetchAndSetStrategies(quote);
  }, [fetchAndSetStrategies, quote]);

  useEffect(() => {
    if (!orderInProgress) return;

    const orderIdInProgress = orderInProgress.create_order.create_id;
    if (orderIdInProgress && address && orderIdInProgress !== orderId) {
      setSearchParams({ orderId: orderIdInProgress }, { replace: true });
    }
  }, [orderInProgress, setSearchParams, searchParams, orderId, address]);

  useEffect(() => {
    if (
      orderInProgress &&
      address &&
      !isCurrentRoute(INTERNAL_ROUTES.swap.path[2])
    ) {
      navigate(INTERNAL_ROUTES.swap.path[2], { replace: true });
    }
  }, [orderInProgress, navigate, address]);

  const handleErrorLog = (order: MatchedOrder, error: string) =>
    console.error("garden error", order.create_order.create_id, error);

  const handleLog = (orderId: string, log: string) =>
    console.log("garden log", orderId, log);

  useEffect(() => {
    if (!garden) return;

    const handleSuccess = (
      order: MatchedOrder,
      action: OrderActions,
      result: string
    ) => {
      const { source_swap, destination_swap } = order;
      const inputAsset = getAssetFromSwap(source_swap, assets);
      const outputAsset = getAssetFromSwap(destination_swap, assets);
      if (!inputAsset || !outputAsset) return;

      const inputAmount = formatAmount(
        order.source_swap.amount,
        inputAsset.decimals,
        6
      );
      const outputAmount = formatAmount(
        order.destination_swap.amount,
        outputAsset.decimals,
        6
      );
      console.log("order success ✅", order.create_order.create_id);

      if (
        orderInProgress &&
        orderInProgress.create_order.create_id ===
          order.create_order.create_id &&
        action === OrderActions.Redeem &&
        result
      ) {
        const updatedOrder = {
          ...order,
          destination_swap: {
            ...order.destination_swap,
            redeem_tx_hash: result,
          },
          status: OrderStatus.RedeemDetected,
        };
        updateOrder(updatedOrder);
      }
      Toast.success(
        `Swap success ${inputAmount} ${inputAsset.symbol} to ${outputAmount} ${outputAsset.symbol}`
      );
    };

    garden.on("error", handleErrorLog);
    garden.on("log", handleLog);
    garden.on("success", handleSuccess);

    return () => {
      garden.off("error", handleErrorLog);
      garden.off("log", handleLog);
      garden.off("success", handleSuccess);
    };
  }, [garden, assets, orderInProgress, updateOrder]);
  console.log(isLoading);

  return (
    <div className="mx-auto mt-10 flex w-full max-w-[328px] flex-col gap-4 pb-60 sm:max-w-[424px]">
      <ToastContainer />
      <div className="relative overflow-hidden rounded-[20px] bg-white/50">
        {isLoading ? (
          <SwapInProgressSkeleton />
        ) : orderInProgress || orderId? (
          <SwapInProgress orderId={orderId} setIsLoading={setIsLoading} />
        ) : !isCurrentRoute("/order") ? (
          <CreateSwap />
        ) : null}
      </div>
    </div>
  );
};
