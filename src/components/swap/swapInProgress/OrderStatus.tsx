import {
  KeyboardDownIcon,
  RadioCheckedIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState, FC } from "react";
import { OrderProgress } from "../../../hooks/useOrderStatus";

type OrderStatusProps = {
  orderProgress: OrderProgress;
};

export const OrderStatus: FC<OrderStatusProps> = ({ orderProgress }) => {
  const [dropdown, setDropdown] = useState(false);

  const handleDropdown = () => setDropdown(!dropdown);

  const NoOfSteps = orderProgress ? Object.values(orderProgress).length : 0;

  const completedSteps =
    orderProgress &&
    Object.values(orderProgress).filter((step) => step.status === "completed")
      .length;

  const currentStatus = Object.values(orderProgress).reduce<string>(
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
    <div className="flex flex-col justify-between bg-white rounded-2xl p-4">
      <div
        onClick={handleDropdown}
        className="flex flex-col gap-2 cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <Typography size="h5" weight="bold">
            Order status
          </Typography>
          <div
            className={`transform transition-transform duration-300 ${
              dropdown ? "rotate-180" : "rotate-0"
            }`}
          >
            <KeyboardDownIcon />
          </div>
        </div>
      </div>
      <div
        className={`transition-all duration-300 overflow-hidden ease-in-out ${
          dropdown ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="mt-2">
          {orderProgress &&
            Object.values(orderProgress).map((step, index) => (
              <li
                key={index}
                className={`relative flex items-center mx-1 gap-1 ${
                  index !== NoOfSteps - 1 ? "pb-4" : ""
                }`}
              >
                {index !== NoOfSteps - 1 &&
                  Object.values(orderProgress)[index + 1].status !==
                    "pending" && (
                    <span
                      className="absolute top-2 h-full border-l-[1px] z-10 border-dark-grey"
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
                  <span className="z-50 relative flex items-center justify-center -translate-x-[3.5px] bg-white rounded-full w-2 h-2 border border-dark-grey">
                    <RadioCheckedIcon className="absolute w-2 h-2" />
                  </span>
                )}
                {step.status === "inProgress" && (
                  <div className="w-2 h-2 rounded-full bg-rose -translate-x-[3.5px] z-50" />
                )}
                {step.status === "pending" && (
                  <div className="w-2 h-2 border-[1px] border-dark-grey rounded-full -translate-x-[3.5px]" />
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
        className={`overflow-hidden ${
          !dropdown ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          transition: dropdown
            ? "max-height 50ms ease-in-out, opacity 300ms ease-in-out" // Opening
            : "max-height 300ms ease-in-out 200ms, opacity 300ms ease-in-out", // Closing
        }}
      >
        <div className="flex mt-2 justify-between items-center">
          <Typography size="h3" weight="bold">
            {currentStatus}
          </Typography>
          <Typography size="h5" weight="bold">
            {completedSteps} of {NoOfSteps}
          </Typography>
        </div>
      </div>
    </div>
  );
};
