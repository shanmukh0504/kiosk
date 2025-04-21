import { SwapInProgress } from "./swapInProgress/SwapInProgress";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { Toast, ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { isBitcoin, MatchedOrder } from "@gardenfi/orderbook";
import { IOType } from "../../constants/constants";
import { formatAmount, getAssetFromSwap } from "../../utils/utils";
import { OrderActions, OrderStatus } from "@gardenfi/core";
import orderInProgressStore from "../../store/orderInProgressStore";
import pendingOrdersStore from "../../store/pendingOrdersStore";

export const Swap = () => {
  const { setAsset } = swapStore();
  const { fetchAndSetStrategies, assets } = assetInfoStore();
  const { garden } = useGarden();
  const { order, isOpen } = orderInProgressStore();
  const { updateOrder } = pendingOrdersStore();

  useEffect(() => {
    if (!garden) return;
    fetchAndSetStrategies(garden.quote);
  }, [fetchAndSetStrategies, garden]);

  useEffect(() => {
    if (!assets) return;
    const bitcoinAsset = Object.values(assets).find((asset) =>
      isBitcoin(asset.chain)
    );
    if (bitcoinAsset) setAsset(IOType.input, bitcoinAsset);
  }, [assets, setAsset]);

  const handleErrorLog = (order: MatchedOrder, error: string) =>
    console.error("garden error", order.create_order.create_id, error);

  const handleLog = (orderId: string, log: string) =>
    console.log("garden log", orderId, log);

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

      const inputAmount = formatAmount(
        order.source_swap.amount,
        inputAsset.decimals
      );
      const outputAmount = formatAmount(
        order.destination_swap.amount,
        outputAsset.decimals
      );
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
  }, [garden, assets, order, updateOrder]);

  return (
    <div className="mx-auto mt-10 flex w-full max-w-[328px] flex-col gap-4 pb-60 sm:max-w-[424px]">
      <ToastContainer />
      <div className={`relative overflow-hidden rounded-[20px] bg-white/50`}>
        {isOpen ? <SwapInProgress /> : <CreateSwap />}
      </div>
    </div>
  );
};
