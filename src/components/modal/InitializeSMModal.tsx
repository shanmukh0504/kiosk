import { Button, Modal } from "@gardenfi/garden-book";
import { useGarden } from "@gardenfi/react-hooks";
import { FC } from "react";

type InitializeSMModalProps = {
  open: boolean;
  onClose: () => void;
};

export const InitializeSMModal: FC<InitializeSMModalProps> = ({
  open,
  onClose,
}) => {
  const { initializeSecretManager, secretManager } = useGarden();

  const handleInitializeSM = async () => {
    if (!initializeSecretManager || secretManager) return;
    const res = await initializeSecretManager();
    if (res.error) {
      console.error("Error initializing secret manager", res.error);
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Children
        opacityLevel={"medium"}
        className="flex flex-col gap-6 backdrop-blur-[20px] rounded-2xl w-[600px] p-6"
      >
        <div>
          Oops, there are some pending orders yet to be executed. Please
          initialize the secretManger{" "}
        </div>
        <Button onClick={handleInitializeSM}>Initialize</Button>
      </Modal.Children>
    </Modal>
  );
};
