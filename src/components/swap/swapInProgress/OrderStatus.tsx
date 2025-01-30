import {
  KeyboardDownIcon,
  RadioCheckedIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { OrderProgress } from "../../../hooks/useOrderStatus";

type OrderStatusProps = {
  orderProgress: OrderProgress;
  isRefunded: boolean;
};

export const OrderStatus: FC<OrderStatusProps> = ({ orderProgress, isRefunded }) => {
  const [dropdown, setDropdown] = useState(false);

  const handleDropdown = () => {
    if (isRefunded) return;
    setDropdown(!dropdown);
  };

  const NoOfSteps = orderProgress ? Object.values(orderProgress).length : 0;

  const completedSteps =
    orderProgress &&
    Object.values(orderProgress).filter(
      (step) => step.status === "completed" || step.status === "inProgress"
    ).length;

  const currentStatus =
    Object.values(orderProgress).find(
      (_, index, array) =>
        index === array.length - 1 || array[index + 1].status === "pending"
    )?.title || "";

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white p-4">
      <div
        onClick={handleDropdown}
        className={`flex flex-col gap-2  ${!isRefunded && "cursor-pointer"} `}
      >
        <div className="flex items-center justify-between">
          <Typography size="h5" weight="bold">
            Order status
          </Typography>
          {!isRefunded && <div
            className={`transform transition-transform duration-300 ${dropdown ? "rotate-180" : "rotate-0"
              }`}
          >
            <KeyboardDownIcon />
          </div>}
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${dropdown ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <ul className="mt-2">
          {orderProgress &&
            Object.values(orderProgress).map((step, index) => (
              <li
                key={index}
                className={`relative mx-1 flex items-center gap-1 ${index !== NoOfSteps - 1 ? "pb-4" : ""
                  }`}
              >
                {index !== NoOfSteps - 1 &&
                  Object.values(orderProgress)[index + 1].status !==
                  "pending" && (
                    <span
                      className="absolute top-2 z-10 h-full border-l-[1px] border-dark-grey"
                      style={{
                        height: "calc(100% + 8px)",
                        borderImage:
                          Object.values(orderProgress)[index + 1].status ===
                            "inProgress"
                            ? "linear-gradient(to bottom, #554B6A, #e36492) 1"
                            : "",
                      }}
                    />
                  )}
                {step.status === "completed" && (
                  <span className="relative z-20 flex h-2 w-2 -translate-x-[3.5px] items-center justify-center rounded-full border border-dark-grey bg-white">
                    <RadioCheckedIcon className="absolute h-2 w-2" />
                  </span>
                )}
                {step.status === "inProgress" && (
                  <div className="z-20 h-2 w-2 -translate-x-[3.5px] rounded-full bg-rose" />
                )}
                {step.status === "pending" && (
                  <div className="h-2 w-2 -translate-x-[3.5px] rounded-full border-[1px] border-dark-grey" />
                )}
                <Typography
                  size="h3"
                  weight={currentStatus === step.title ? "bold" : "medium"}
                >
                  {step.title}
                </Typography>
              </li>
            ))}
        </ul>
      </div>
      <div
        className={`overflow-hidden ${!dropdown ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        style={{
          transition: dropdown
            ? "max-height 50ms ease-in-out, opacity 300ms ease-in-out"
            : "max-height 300ms ease-in-out 200ms, opacity 300ms ease-in-out",
        }}
      >
        <div className="mt-2 flex items-center justify-between">
          <Typography size="h3" weight="bold">
            {isRefunded ? "Refunded" : currentStatus}
          </Typography>
          {!isRefunded && (
            <Typography size="h5" weight="bold" className="my-auto">
              {completedSteps} of {NoOfSteps}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
