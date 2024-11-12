import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";

export const Swap = () => {
  const { btcInitModal } = swapStore();
  const { fetchAndSetAssetsAndChains, fetchAndSetStrategies, assets } =
    assetInfoStore();
  const { quote } = useGarden();

  useEffect(() => {
    fetchAndSetAssetsAndChains();
  }, [fetchAndSetAssetsAndChains]);

  useEffect(() => {
    if (!quote) return;
    fetchAndSetStrategies(quote);
  }, [fetchAndSetStrategies, quote]);

  // useEffect(() => {
  //   if (!assets) return;
  //   const bitcoinAsset = Object.values(assets).find((asset) =>
  //     isBitcoin(asset.chain)
  //   );
  //   if (bitcoinAsset) setAsset(IOType.input, bitcoinAsset);
  // }, [assets, setAsset]);

  return (
    <div className="flex flex-col gap-4 w-full sm:max-w-[424px] max-w-[328px] mx-auto mt-10">
      <ToastContainer />
      <div
        className={`bg-white/50 rounded-[20px]
          relative overflow-hidden`}
      >
        {btcInitModal.isOpen ? <BTCInit /> : <CreateSwap />}
      </div>
    </div>
  );
};
