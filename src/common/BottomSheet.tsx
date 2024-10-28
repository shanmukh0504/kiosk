import { FC } from "react";
import { Drawer } from "vaul";

type BottomSheetProps = {
  children: React.ReactNode;
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
        <Drawer.Content className="bg-white/50 backdrop-blur-[20px] rounded-xl w-full h-fit p-4 fixed bottom-0 z-10 outline-none">
          <div className="bg-white/30 rounded-full w-[60px] h-1 mx-auto mb-5" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
