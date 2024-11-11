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
    <BottomSheet open={open} onOpenChange={onClose}>
      <AddressMenu onClose={onClose} />
      <Transactions isOpen={open} />
    </BottomSheet>
  );
};
