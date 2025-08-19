import { useEffect, useRef, FC, useCallback } from "react";
import { Transactions } from "./Transactions";
import { CloseIcon } from "@gardenfi/garden-book";
import { AddressMenu } from "./header/AddressMenu";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const TransactionsSidebar: FC<SidebarProps> = ({ open, onClose }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );
  const handleCloseIconClick = () => onClose();

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [handleClickOutside]);

  return (
    <div
      className={`absolute left-0 top-0 z-50 h-full w-full bg-dark-grey transition-colors duration-500 ease-cubic-in-out ${open ? "bg-opacity-40" : "pointer-events-none bg-opacity-0"}`}
    >
      <div
        ref={sliderRef}
        className={`fixed top-0 flex flex-col bg-white/50 backdrop-blur-[20px] ${open ? "right-0" : "right-[-480px]"} transition-right scrollbar-hide h-full w-[480px] overflow-y-auto duration-500 ease-cubic-in-out`}
      >
        <div className="flex justify-end p-6">
          <CloseIcon
            className="h-[14px] w-6 cursor-pointer"
            onClick={handleCloseIconClick}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex max-h-[100vh] flex-col gap-5 px-6">
          <AddressMenu onClose={onClose} />
          <Transactions isOpen={open} />
        </div>
      </div>
    </div>
  );
};
