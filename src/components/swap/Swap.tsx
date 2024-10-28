import { BTCInit } from "./BTCInit";
import { CreateSwap } from "./CreateSwap";
import { swapStore } from "../../store/swapStore";
import { ToastContainer } from "../toast/Toast";
import { assetInfoStore } from "../../store/assetInfoStore";
import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { isBitcoin } from "@gardenfi/orderbook";
import { IOType } from "../../constants/constants";

export const Swap = () => {
  const { btcInitModal, setAsset } = swapStore();
  const { fetchAndSetAssetsAndChains, fetchAndSetStrategies, assets } =
    assetInfoStore();
  const { quote } = useGarden();

  //TODO: add a loader until assets, chains, and strategies are fetched
  useEffect(() => {
    fetchAndSetAssetsAndChains();
  }, []);

  useEffect(() => {
    if (!quote) return;
    fetchAndSetStrategies(quote);
  }, [quote]);

  useEffect(() => {
    if (!assets) return;
    const bitcoinAsset = Object.values(assets).find((asset) =>
      isBitcoin(asset.chain),
    );
    if (bitcoinAsset) setAsset(IOType.input, bitcoinAsset);
  }, [assets]);

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