import { FC, ReactNode } from "react";
import { Drawer } from "vaul";

type BottomSheetProps = {
  children: ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const BottomSheet: FC<BottomSheetProps> = ({
  children,
  open,
  onOpenChange,
}) => {
  return (
    <div
      className={`absolute z-50 h-full w-full bg-dark-grey transition-colors duration-500 ease-cubic-in-out ${open ? "bg-opacity-40" : "pointer-events-none bg-opacity-0"}`}
    >
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Content className="fixed bottom-0 z-10 h-fit w-full rounded-t-xl bg-white/50 px-4 pt-4 outline-none backdrop-blur-[20px]">
            <div className="mx-auto mb-5 h-1 w-[60px] rounded-full bg-white/30" />
            <div className="scrollbar-hide flex max-h-[70vh] flex-col gap-5 overflow-y-scroll">
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
};
