import { useEffect } from "react";
import { SwapInProgress } from "./swapInProgress/SwapInProgress";
import { CreateSwap } from "./CreateSwap";
import { Toast, ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useGarden } from "@gardenfi/react-hooks";
import { MatchedOrder } from "@gardenfi/orderbook";
import { getAssetFromSwap } from "../../utils/utils";
import { OrderActions, OrderStatus } from "@gardenfi/core";
import orderInProgressStore from "../../store/orderInProgressStore";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { useSearchParams } from "react-router-dom";
export const Swap = () => {
  const [, setSearchParams] = useSearchParams();

  const { fetchAndSetStrategies, assets } = assetInfoStore();
  const { garden } = useGarden();
  const { order, isOpen } = orderInProgressStore();
  const { updateOrder } = pendingOrdersStore();

  useEffect(() => {
    fetchAndSetStrategies();
  }, [fetchAndSetStrategies]);

  const handleErrorLog = (order: MatchedOrder, error: string) =>
    console.error("garden error", order.create_order.create_id, error);

  const handleLog = (orderId: string, log: string) =>
    console.log("garden log", orderId, log);

  useEffect(() => {
    if (isOpen) {
      setSearchParams({});
    }
  }, [isOpen, setSearchParams]);

  useEffect(() => {
    if (!garden) return;

    const handleSuccess = (
      order: MatchedOrder,
      _: OrderActions,
      result: string
    ) => {
      const { source_swap, destination_swap } = order;
      const inputAsset = getAssetFromSwap(source_swap, assets);
      const outputAsset = getAssetFromSwap(destination_swap, assets);
      if (!inputAsset || !outputAsset) return;

      console.log("order success ✅", order.create_order.create_id);

      const updatedOrder = {
        ...order,
        destination_swap: {
          ...order.destination_swap,
          redeem_tx_hash: result,
        },
        status: OrderStatus.RedeemDetected,
      };
      updateOrder(updatedOrder);

      Toast.success(
        `Swap success ${inputAsset.symbol} to ${outputAsset.symbol}`
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
  }, [garden, assets, order, updateOrder]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[328px] flex-col justify-center gap-4 sm:min-h-[calc(100vh-96px)] sm:max-w-[424px]">
      <div className="flex h-full flex-col justify-center gap-4 sm:-translate-y-7">
        <ToastContainer />
        <div
          className={`relative overflow-hidden rounded-[20px] bg-white/50 sm:translate-y-[-48px]`}
        >
          {isOpen ? <SwapInProgress /> : <CreateSwap />}
        </div>
      </div>
    </div>
  );
};
