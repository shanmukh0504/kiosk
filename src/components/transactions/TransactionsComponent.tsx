import { FC } from "react";
import { TransactionsBottomSheet } from "./TransactionsBottomSheet";
import { TransactionsSidebar } from "./TransactionsSidebar";
import { ModalProps } from "../modal/Modal";
import { viewPortStore } from "../../store/viewPortStore";

export const TransactionsComponent: FC<ModalProps> = ({ open, onClose }) => {
  const { isMobile } = viewPortStore();

  return (
    <div>
      {isMobile ? (
        <TransactionsBottomSheet open={open} onClose={onClose} />
      ) : (
        <TransactionsSidebar open={open} onClose={onClose} />
      )}
    </div>
  );
};
