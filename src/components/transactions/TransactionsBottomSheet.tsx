import { BottomSheet } from "../../common/BottomSheet";
import { AddressMenu } from "./AddressMenu";
import { FC } from "react";
import { Transactions } from "./Transactions";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
};

export const TransactionsBottomSheet: FC<BottomSheetProps> = ({
  open,
  onClose,
}) => {
  return (
    <div
      className={`bg-dark-grey
      absolute z-50
      h-full w-full
      transition-colors ease-cubic-in-out duration-500
      ${open ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}
    >
      <BottomSheet open={open} onOpenChange={onClose}>
        <AddressMenu onClose={onClose} />
        <Transactions isOpen={open} />
      </BottomSheet>
    </div>
  );
};
