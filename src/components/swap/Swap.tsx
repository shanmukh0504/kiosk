import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { SwapDetails } from "../../constants/constants";
import { Toast } from "../../common/Toast";

export const Swap = () => {
  const { btcInitModal } = swapStore();
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
        ${toast ? "mt-4" : "mt-20"}`}
      >
        {btcInitModal.isOpen ? <BTCInit /> : <CreateSwap />}
      </div>
    </div>
  );
};
