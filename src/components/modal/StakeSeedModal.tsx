import { FC } from "react";
import { Modal } from "@gardenfi/garden-book";
import { useViewport } from "../../hooks/useViewport";
import { BottomSheet } from "../../common/BottomSheet";
import { StakeSeed } from "../stake/StakeSeed";

type StakeSeedProps = {
    open: boolean;
    onClose: () => void;
};

export const StakeSeedModal: FC<StakeSeedProps> = ({ open, onClose }) => {
    const { isMobile } = useViewport();

    return (
        <>
            {isMobile ? (
                <BottomSheet open={open} onOpenChange={onClose}>
                    <StakeSeed onClose={onClose} />
                </BottomSheet>
            ) : (
                <Modal open={open} onClose={onClose}>
                    <Modal.Children
                        opacityLevel={"medium"}
                        className="flex flex-col gap-6 rounded-2xl  w-[600px] p-6"
                    >
                        <StakeSeed onClose={onClose} />
                    </Modal.Children>
                </Modal>
            )}
        </>
    );
};
