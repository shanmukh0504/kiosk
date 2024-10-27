import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";

export const Swap = () => {
  const { btcInitModal } = swapStore();
  const { fetchAndSetAssetsAndChains } = assetInfoStore();

  useEffect(() => {
    fetchAndSetAssetsAndChains();
  }, []);

  return (
    <div className="w-full max-w-[424px] mx-auto">
      <ToastContainer />
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
