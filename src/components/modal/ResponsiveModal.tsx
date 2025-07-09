import { BottomSheet, Modal, OpacityVariants } from "@gardenfi/garden-book";
import { FC, ReactNode } from "react";
import { ModalProps } from "./Modal";
import { viewPortStore } from "../../store/viewPortStore";
import { modalStore } from "../../store/modalStore";

export const ResponsiveModal: FC<
  ModalProps & {
    children: ReactNode;
    opacityLevel?: OpacityVariants;
  }
> = ({ open, onClose, children, opacityLevel = "medium" }) => {
  const { isMobile } = viewPortStore();
  const { modalName } = modalStore();

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
            className={`relative flex max-w-[600px] flex-col gap-6 rounded-2xl p-3 ${modalName.assetList ? "overflow-hidden" : ""}`}
          >
            {children}
          </Modal.Children>
        </Modal>
      )}
    </>
  );
};
