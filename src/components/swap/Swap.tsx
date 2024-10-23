import { ConfirmSwap } from "./ConfirmSwap";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { useGarden } from "@gardenfi/react-hooks";

export const Swap = () => {
  const { confirmSwap } = swapStore();
  const { initializeSecretManager } = useGarden();

  return (
    <div className="w-full max-w-[424px] mx-auto px-4 sm:px-0">
      {toast &&
        <div className="mt-6">
          <Toast content={toast} link="https://garden.finance" />
        </div>
      }
      <div
        className={`bg-white/50 rounded-[20px]
        relative overflow-hidden
        mt-20`}
      >
        {confirmSwap.isOpen ? <ConfirmSwap /> : <CreateSwap />}
      </div>
    </div>
  );
};
