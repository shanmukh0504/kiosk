import {
  KeyboardDownIcon,
  KeyboardUpIcon,
  RadioCheckedIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useEffect, useState, FC, useMemo } from "react";
import {
  SimplifiedOrderStatus,
  useOrderStatus,
} from "../../../hooks/useOrderStatus";
import { MatchedOrder } from "@gardenfi/orderbook";
import { blockNumberStore } from "../../../store/blockNumberStore";
import { getAssetFromSwap } from "../../../utils/utils";
import { assetInfoStore } from "../../../store/assetInfoStore";

type OrderStatusProps = {
  order: MatchedOrder;
};

export const OrderStatus: FC<OrderStatusProps> = ({ order }) => {
  const [dropdown, setDropdown] = useState(true);
  const [currentState, setCurrentState] = useState(0);
  const { simplifiedStatus } = useOrderStatus(order);
  const { assets } = assetInfoStore();
  const { blockNumbers } = blockNumberStore();

  const outputAsset = order && getAssetFromSwap(order.destination_swap, assets);
  const initBlockNumber = Number(order.source_swap.initiate_block_number);
  const confirmationsString = useMemo(() => {
    return simplifiedStatus === SimplifiedOrderStatus.depositDetected &&
      blockNumbers
      ? Math.abs(
          initBlockNumber
            ? blockNumbers[order.source_swap.chain] - initBlockNumber
            : 0
        ) +
          "/" +
          order.source_swap.required_confirmations
      : "";
  }, [simplifiedStatus, blockNumbers, order, initBlockNumber]);

  const handleDropdown = () => setDropdown(!dropdown);

  useEffect(() => {
    if (!simplifiedStatus) return;

    const statusMap = {
      [SimplifiedOrderStatus.swapCompleted]: 4,
      [SimplifiedOrderStatus.redeemingWBTC]: 3,
      [SimplifiedOrderStatus.depositDetected]: 2,
      [SimplifiedOrderStatus.detectingDeposit]: 1,
      [SimplifiedOrderStatus.orderCreated]: 0,
    };
    setCurrentState(statusMap[simplifiedStatus] ?? 0);
  }, [simplifiedStatus]);

  const timelineData = {
    0: "Order created",
    1: "Detecting deposit",
    2: "Deposit detected",
    3: "Redeeming " + outputAsset?.symbol,
    4: "Swap completed",
  };
  const timelineDataLength = Object.keys(timelineData).length;

  return (
    <div className="flex flex-col gap-2 justify-between bg-white rounded-2xl p-4">
      <div
        onClick={handleDropdown}
        className="flex flex-col gap-2 cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <Typography size="h5" weight="bold">
            Order status
          </Typography>
          {dropdown ? <KeyboardUpIcon /> : <KeyboardDownIcon />}
        </div>
      </div>
      {dropdown ? (
        <div className="">
          <ul className="">
            {Object.values(timelineData).map((name, index) => {
              if (index === 2 && currentState <= 1) return null;
              if (index === 1 && currentState >= 2) return null;

              return (
                <li
                  key={index}
                  className={`relative flex items-center mx-1 gap-1 ${
                    index !== timelineDataLength - 1 ? "pb-4" : ""
                  } `}
                >
                  {index !== timelineDataLength - 1 && currentState > index && (
                    <span
                      className="absolute -left-[1px] top-2 h-full border-l-[1px] z-10 border-dark-grey"
                      style={{
                        height: "calc(100% + 8px)",
                        borderImage:
                          index === currentState - 1 && currentState !== 4
                            ? "linear-gradient(to bottom, #554B6A, #e36492) 1"
                            : "",
                      }}
                    />
                  )}
                  {(index === 0 && currentState == 0) ||
                  (index === 4 && currentState === 4) ? (
                    <RadioCheckedIcon className="relative w-2 h-2 -translate-x-[4.5px] !z-50" />
                  ) : index >= currentState ? (
                    <div className="w-2 h-2 rounded-full bg-rose -translate-x-[4.5px] z-50" />
                  ) : (
                    <RadioCheckedIcon className="relative w-2 h-2 -translate-x-[4.5px] !z-50" />
                  )}
                  <div className="flex w-full justify-between">
                    <Typography size="h3">{name}</Typography>
                    {index === 2 && (
                      <Typography size="h4">{confirmationsString}</Typography>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <Typography size="h3" weight="bold">
            {simplifiedStatus}
          </Typography>
          <Typography size="h5" weight="bold">
            {currentState} of 4
          </Typography>
        </div>
      )}
    </div>
  );
};
