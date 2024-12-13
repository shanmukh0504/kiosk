import { SwapInProgress } from "./swapInProgress/SwapInProgress";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { Toast, ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { isBitcoin, MatchedOrder } from "@gardenfi/orderbook";
import { IOType } from "../../constants/constants";
import { formatAmount } from "../../utils/utils";
import { OrderActions } from "@gardenfi/core";
import { generateTokenKey } from "../../utils/generateTokenKey";

export const Swap = () => {
  const { swapInProgress, setAsset, setSwapInProgress } = swapStore();
  const { fetchAndSetAssetsAndChains, fetchAndSetStrategies, assets } =
    assetInfoStore();
  const { quote, garden } = useGarden();
  const { order: orderInProgress, isOpen } = swapInProgress;

  useEffect(() => {
    fetchAndSetAssetsAndChains();
  }, [fetchAndSetAssetsAndChains]);

  useEffect(() => {
    if (!quote) return;
    fetchAndSetStrategies(quote);
  }, [fetchAndSetStrategies, quote]);

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
      action: OrderActions,
      result: string
    ) => {
      const { source_swap, destination_swap } = order;
      const inputAsset =
        assets &&
        assets[generateTokenKey(source_swap.chain, source_swap.asset)];
      const outputAsset =
        assets &&
        assets[
          generateTokenKey(destination_swap.chain, destination_swap.asset)
        ];
      if (!inputAsset || !outputAsset) return;

      const inputAmount = formatAmount(
        order.source_swap.amount,
        inputAsset.decimals
      );
      const outputAmount = formatAmount(
        order.destination_swap.amount,
        outputAsset.decimals
      );
      console.log("success order ✅", order.create_order.create_id);
      if (
        orderInProgress &&
        orderInProgress.create_order.create_id ===
          order.create_order.create_id &&
        action === OrderActions.Redeem &&
        result &&
        isOpen
      ) {
        const updatedOrder = {
          ...order,
          destination_swap: {
            ...order.destination_swap,
            redeem_tx_hash: result,
          },
        };
        setSwapInProgress({ isOpen: true, order: updatedOrder });
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
  }, [garden, assets, orderInProgress, isOpen, setSwapInProgress]);

  return (
    <div className="flex flex-col gap-4 w-full sm:max-w-[424px] max-w-[328px] mx-auto mt-10">
      <ToastContainer />
      <div
        className={`bg-white/50 rounded-[20px]
          relative overflow-hidden`}
      >
        {swapInProgress.isOpen ? <SwapInProgress /> : <CreateSwap />}
      </div>
    </div>
  );
};
