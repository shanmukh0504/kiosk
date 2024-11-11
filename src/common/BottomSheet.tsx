import { FC, ReactNode } from "react";
import { Drawer } from "vaul";

type BottomSheetProps = {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const BottomSheet: FC<BottomSheetProps> = ({
  children,
  open,
  onOpenChange,
}) => {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Content className="bg-white/50 backdrop-blur-[20px] rounded-t-xl w-full h-fit px-4 pt-4 fixed bottom-0 z-10 outline-none">
          <div className="bg-white/30 rounded-full  w-[60px] h-1 mx-auto " />
          <div className="flex flex-col gap-5  overflow-y-scroll max-h-[70vh] scrollbar-hide">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
