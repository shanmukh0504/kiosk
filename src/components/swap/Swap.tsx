import { SwapInProgress } from "./swapInProgress/SwapInProgress";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { isBitcoin } from "@gardenfi/orderbook";
import { IOType } from "../../constants/constants";

export const Swap = () => {
  const { swapInProgress, setAsset } = swapStore();
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

  useEffect(() => {
    if (!assets) return;
    const bitcoinAsset = Object.values(assets).find((asset) =>
      isBitcoin(asset.chain)
    );
    if (bitcoinAsset) setAsset(IOType.input, bitcoinAsset);
  }, [assets, setAsset]);

  return (
    <div className="flex flex-col gap-4 w-full sm:max-w-[424px] max-w-[328px] mx-auto mt-10">
      <ToastContainer />
      <div
        className={`bg-white/50 rounded-[20px]
          relative overflow-hidden`}
      >
        {swapInProgress.isOpen ? <SwapInProgress /> : <CreateSwap />}
      </div>
    </div>
  );
};
