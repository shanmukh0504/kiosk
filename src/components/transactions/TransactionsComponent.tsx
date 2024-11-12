import { FC, useMemo } from "react";
import { useViewport } from "../../hooks/useViewport";
import { TransactionsBottomSheet } from "./TransactionsBottomSheet";
import { TransactionsSidebar } from "./TransactionsSidebar";
import { BREAKPOINTS } from "../../constants/constants";

type TransactionsViewProps = {
  open: boolean;
  onClose: () => void;
};

export const TransactionsComponent: FC<TransactionsViewProps> = ({
  open,
  onClose,
}) => {
  const { width } = useViewport();
  const isSmall = useMemo(() => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || width < BREAKPOINTS.sm;
  }, [width]);

  return (
    <div>
      {isSmall ? (
        <TransactionsBottomSheet open={open} onClose={onClose} />
      ) : (
        <TransactionsSidebar open={open} onClose={onClose} />
      )}
    </div>
  );
};
