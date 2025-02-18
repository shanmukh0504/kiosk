import { Modal } from "@gardenfi/garden-book";
import { BottomSheet } from "../../common/BottomSheet";
import { FC, ReactNode } from "react";
import { ModalProps } from "./Modal";
import { viewPortStore } from "../../store/viewPortStore";

export const ResponsiveModal: FC<
  ModalProps & {
    children: ReactNode;
  }
> = ({ open, onClose, children }) => {
  const { isMobile } = viewPortStore();

  return (
    <>
      {isMobile ? (
        <BottomSheet open={open} onOpenChange={onClose}>
          {children}
        </BottomSheet>
      ) : (
        <Modal open={open} onClose={onClose}>
          <Modal.Children
            opacityLevel={"medium"}
            className="flex max-w-[600px] flex-col gap-6 rounded-2xl p-3"
          >
            {children}
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
