import {
  ArrowNorthEastIcon,
  CloseIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useCallback, useEffect, useMemo } from "react";
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
import { API } from "../../../constants/api";
import { useNavigate } from "react-router-dom";
import { blockNumberStore } from "../../../store/blockNumberStore";
import { useGarden } from "@gardenfi/react-hooks";
import { useEVMWallet } from "../../../hooks/useEVMWallet";

export const SwapInProgress = ({
  orderId,
  setIsLoading,
}: {
  orderId: string;
  setIsLoading: (loading: boolean) => void;
}) => {
  const {
    setOrderInProgress,
    orderInProgress: order,
    fetchOrderById,
  } = ordersStore();
  const { assets } = assetInfoStore();
  const navigate = useNavigate();
  const { orderProgress, viewableStatus } = useOrderStatus();
  const { orderBook } = useGarden();
  const { fetchAndSetBlockNumbers } = blockNumberStore();
  const { address } = useEVMWallet();

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

  const goBack = useCallback(() => {
    setOrderInProgress(null);
    navigate("/");
  }, [setOrderInProgress, navigate]);

  const handleClickTransaction = () => {
    if (!order) return;
    window.open(API().explorer(order.create_order.create_id));
  };

  useEffect(() => {
    if (!orderId || !orderBook) return;

    if (!address) {
      navigate("/", { replace: true });
      return;
    }
    if (order && order.create_order.create_id === orderId) return;

    const fetchOrderByOrderId = async () => {
      try {
        setIsLoading(true);
        await fetchAndSetBlockNumbers();
        const order = await fetchOrderById(orderId, orderBook);
        console.log(order);
        setOrderInProgress(order);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderByOrderId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    fetchAndSetBlockNumbers,
    fetchOrderById,
    orderBook,
    setOrderInProgress,
    orderId,
  ]);

  return order ? (
    <div className="animate-fade-out flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between p-1">
        <Typography size="h4" weight="bold">
          Swap progress
        </Typography>
        <CloseIcon className="m-1 h-3 w-3 cursor-pointer" onClick={goBack} />
      </div>
      <div
        className="flex cursor-pointer flex-col gap-2 rounded-2xl bg-white/50 p-4 hover:bg-white"
        onClick={handleClickTransaction}
      >
        <div className="flex items-center gap-2">
          <Typography size="h5" weight="bold">
            Transaction
          </Typography>
          <ArrowNorthEastIcon className="h-[10px] w-[10px]" />
        </div>
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
      <OrderStatus
        orderProgress={orderProgress}
        viewableStatus={viewableStatus}
      />
      <OrderDetails order={order} />
    </div>
  ) : (
    <></>
  );
};
