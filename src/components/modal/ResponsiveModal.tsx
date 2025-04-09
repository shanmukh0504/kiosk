import { Modal } from "@gardenfi/garden-book";
import { BottomSheet } from "../../common/BottomSheet";
import { FC, ReactNode } from "react";
import { ModalProps } from "./Modal";
import { viewPortStore } from "../../store/viewPortStore";

export type OpacityLevel =
  | "light"
  | "medium"
  | "semi-dark"
  | "extra-light"
  | "full"
  | null
  | undefined;

export const ResponsiveModal: FC<
  ModalProps & {
    children: ReactNode;
    opacityLevel?: OpacityLevel;
  }
> = ({ open, onClose, children, opacityLevel = "medium" }) => {
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
            opacityLevel={opacityLevel}
            className="flex max-w-[600px] flex-col gap-6 rounded-2xl p-3"
          >
            {children}
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
