import { FC } from "react";
import { useViewport } from "../../hooks/useViewport";
import { TransactionsBottomSheet } from "./TransactionsBottomSheet";
import { TransactionsSidebar } from "./TransactionsSidebar";

type TransactionsViewProps = {
  open: boolean;
  onClose: () => void;
};

export const TransactionsComponent: FC<TransactionsViewProps> = ({
  open,
  onClose,
}) => {
  const { isMobile } = useViewport();

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
