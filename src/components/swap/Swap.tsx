import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { ToastContainer } from "../toast/Toast";

export const Swap = () => {
  const { btcInitModal } = swapStore();

  return (
    <div className="w-full max-w-[424px] mx-auto px-4 sm:px-0">
      {/* {toast &&
        <div className="mt-6">
          <Toast content={toast} link="https://garden.finance" />
        </div>
      } */}
    <div className="w-full max-w-[424px] mx-auto">
      <ToastContainer />
      <div
        className="bg-white/50 rounded-[20px]
        relative overflow-hidden mt-20"
      >
        {btcInitModal.isOpen ? <BTCInit /> : <CreateSwap />}
      </div>
    </div>
  );
};
