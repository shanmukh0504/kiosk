import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { useGarden } from "@gardenfi/react-hooks";

export const Swap = () => {
  const { btcInitModal } = swapStore();
  const { initializeSecretManager } = useGarden();

  return (
    <div className="w-full max-w-[424px] mx-auto">
      <div
        className="cursor-pointer"
        onClick={async () => {
          if (!initializeSecretManager) return;
          await initializeSecretManager();
        }}
      >
        initializeSecretManager
      </div>
      <div
        className={`bg-white/50 rounded-[20px]
        relative overflow-hidden
        mt-20`}
      >
        {btcInitModal.isOpen ? <BTCInit /> : <CreateSwap />}
      </div>
    </div>
  );
};
