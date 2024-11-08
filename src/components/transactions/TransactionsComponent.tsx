import { FC } from "react";
import { useViewport } from "../../hooks/useViewport";
import { TransactionsBottomSheet } from "./TransactionsBottomSheet";
import { Sidebar } from "./Sidebar";
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
  const isSmall = width < BREAKPOINTS.sm;

  return (
    <div>
      {isSmall ? (
        <TransactionsBottomSheet open={open} onClose={onClose} />
      ) : (
        <Sidebar open={open} onClose={onClose} />
      )}
    </div>
  );
};
