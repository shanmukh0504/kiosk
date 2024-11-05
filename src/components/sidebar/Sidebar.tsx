import { useEffect, useRef, FC, useCallback } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { Transactions } from "./Transactions";
import { CloseIcon } from "@gardenfi/garden-book";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
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
      className={`bg-dark-grey
        absolute top-0 left-0 z-50
        h-full w-full
        transition-colors ease-cubic-in-out duration-500
        ${open ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"}`}
    >
      <div
        ref={sliderRef}
        className={`flex flex-col bg-white/50 backdrop-blur-[20px] fixed top-0
          ${open ? "right-0" : "right-[-480px]"}
          w-[480px] h-full transition-right ease-cubic-in-out duration-500`}
      >
        <div className="flex justify-end p-6">
          <CloseIcon
            className="w-6 h-[14px] cursor-pointer"
            onClick={handleCloseIconClick}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col gap-5 px-6 pb-6 overflow-y-auto max-h-[100vh]">
          <SidebarMenu onClose={onClose} />
          <Transactions isSidebarOpen={open} />
        </div>
      </div>
    </div>
  );
};
