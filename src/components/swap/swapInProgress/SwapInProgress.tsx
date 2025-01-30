import { CloseIcon, Typography } from "@gardenfi/garden-book";
import { useCallback, useMemo } from "react";
import { SwapInfo } from "../../../common/SwapInfo";
import { getTrimmedAddress } from "../../../utils/getTrimmedAddress";
import { formatAmount, getAssetFromSwap } from "../../../utils/utils";
import { assetInfoStore } from "../../../store/assetInfoStore";
import QRCode from "react-qr-code";
import { OrderStatus } from "./OrderStatus";
import { OrderDetails } from "./OrderDetails";
import { isBitcoin } from "@gardenfi/orderbook";
import { CopyToClipboard } from "../../../common/CopyToClipboard";
import { useOrderStatus } from "../../../hooks/useOrderStatus";
import { OrderStatus as OrderStatusEnum } from "@gardenfi/core";
import { ordersStore } from "../../../store/ordersStore";

export const SwapInProgress = () => {
  const { setOrderInProgress, orderInProgress: order } = ordersStore();
  const { assets } = assetInfoStore();
  const { orderProgress } = useOrderStatus();

  const { depositAddress, inputAsset, outputAsset } = useMemo(() => {
    return {
      depositAddress:
        order && isBitcoin(order?.source_swap.chain)
          ? order.source_swap.swap_id
          : "",
      inputAsset: order && getAssetFromSwap(order.source_swap, assets),
      outputAsset: order && getAssetFromSwap(order.destination_swap, assets),
      btcAddress: order
        ? order.create_order.additional_data.bitcoin_optional_recipient
        : "",
    };
  }, [assets, order]);

  const goBack = useCallback(
    () => setOrderInProgress(null),
    [setOrderInProgress]
  );

  return order ? (
    <div className="animate-fade-out flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between p-1">
        <Typography size="h4" weight="bold">
          Swap progress
        </Typography>
        <CloseIcon className="m-1 h-3 w-3 cursor-pointer" onClick={goBack} />
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-white/50 p-4">
        <Typography size="h5" weight="bold">
          Transaction
        </Typography>
        {inputAsset && outputAsset && (
          <SwapInfo
            sendAsset={inputAsset}
            receiveAsset={outputAsset}
            sendAmount={formatAmount(
              order.source_swap.amount,
              inputAsset.decimals
            )}
            receiveAmount={formatAmount(
              order.destination_swap.amount,
              outputAsset.decimals
            )}
          />
        )}
      </div>
      {inputAsset &&
        isBitcoin(inputAsset.chain) &&
        (order.status === OrderStatusEnum.Matched ||
          order.status === OrderStatusEnum.Created) && (
          <div className="flex justify-between rounded-2xl bg-white p-4">
            <div className="flex flex-col gap-2">
              <Typography size="h5" weight="bold">
                Deposit address
              </Typography>
              <div className="flex items-center gap-2">
                <Typography size="h3" weight="bold">
                  {getTrimmedAddress(depositAddress, 8, 6)}
                </Typography>
                <CopyToClipboard text={depositAddress} />
              </div>
            </div>
            <QRCode value={depositAddress} size={48} fgColor="#554B6A" />
          </div>
        )}
      <OrderStatus orderProgress={orderProgress} />
      <OrderDetails order={order} />
    </div>
  ) : (
    <></>
  );
};
