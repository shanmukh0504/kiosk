import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";
import { fetchAssetsData } from "./AssetSelector/fetchAssets";

export const Swap = () => {
  const { btcInitModal } = swapStore();
  const { setAssets, setChains, setError, setLoading } = assetInfoStore();

  useEffect(() => {
    setLoading(true);
    fetchAssetsData()
      .then(({ assets, chains }) => {
        setAssets(assets);
        setChains(chains);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
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
