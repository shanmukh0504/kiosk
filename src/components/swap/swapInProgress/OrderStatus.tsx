import {
  KeyboardDownIcon,
  KeyboardUpIcon,
  RadioCheckedIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { useOrderStatus } from "../../../hooks/useOrderStatus";
import { MatchedOrder } from "@gardenfi/orderbook";

type OrderStatusProps = {
  order: MatchedOrder;
};

export const OrderStatus: FC<OrderStatusProps> = ({ order }) => {
  const [dropdown, setDropdown] = useState(true);
  const { simplifiedStatus } = useOrderStatus(order);

  const handleDropdown = () => setDropdown(!dropdown);

  const NoOfSteps = simplifiedStatus
    ? Object.values(simplifiedStatus).length
    : 0;

  const completedSteps =
    simplifiedStatus &&
    Object.values(simplifiedStatus).filter(
      (step) => step.status === "completed"
    ).length;

  const currentStatus = Object.values(simplifiedStatus).reduce<string>(
    (acc, step, index, array) => {
      if (
        index === array.length - 1 ||
        (step.status === "completed" && array[index + 1].status !== "completed")
      ) {
        acc = step.title;
      }
      return acc;
    },
    ""
  );

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
        <ul>
          {simplifiedStatus &&
            Object.values(simplifiedStatus).map((step, index) => (
              <li
                key={index}
                className={`relative flex items-center mx-1 gap-1 ${
                  index !== NoOfSteps - 1 ? "pb-4" : ""
                }`}
              >
                {index !== NoOfSteps - 1 &&
                  Object.values(simplifiedStatus)[index + 1].status !==
                    "pending" && (
                    <span
                      className="absolute -left-[1px] top-2 h-full border-l-[1px] z-10 border-dark-grey"
                      style={{
                        height: "calc(100% + 8px)",
                        borderImage:
                          Object.values(simplifiedStatus)[index + 1].status ===
                          "inProgress"
                            ? "linear-gradient(to bottom, #554B6A, #e36492) 1"
                            : "",
                      }}
                    />
                  )}
                {step.status === "completed" && (
                  <RadioCheckedIcon className="relative w-2 h-2 -translate-x-[4.5px]" />
                )}
                {step.status === "inProgress" && (
                  <div className="w-2 h-2 rounded-full bg-rose -translate-x-[4.5px] z-50" />
                )}
                {step.status === "pending" && (
                  <div className="w-2 h-2 border-[1px] border-dark-grey rounded-full -translate-x-[4.5px]" />
                )}
                <Typography size="h3">{step.title}</Typography>
              </li>
            ))}
        </ul>
      ) : (
        <div className="flex justify-between items-center">
          <Typography size="h3" weight="bold">
            {currentStatus}
          </Typography>
          <Typography size="h5" weight="bold">
            {completedSteps} of 4
          </Typography>
        </div>
      )}
    </div>
  );
};
