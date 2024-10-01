import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { useEffect, useMemo, useState } from "react";
import { SwapInput } from "./SwapInput";
import { Asset, Chain } from "../../constants/constants";
import { SwapDetails } from "./SwapDetails";
import { SwapAddress } from "./SwapAddress";
import { assetInfoStore } from "../../store/assetInfoStore";

export const Swap = () => {
  const { assetsData, fetchAssetsData } = assetInfoStore();

  const networks = useMemo(() => {
    if (assetsData) {
      return assetsData.data.networks;
    }
  }, [assetsData]);

  const [supportedChains, setSupportedChains] = useState<Chain[]>([]);
  const [supportedAssets, setSupportedAssets] = useState<Asset[]>([]);
  const [sendAsset, setSendAsset] = useState<Asset>();
  const [receiveAsset, setReceiveAsset] = useState<Asset>();
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    void fetchAssetsData();
  }, [fetchAssetsData]);

  // Once the data has been fetched, initialise the supported chains and assets
  // lists
  useEffect(() => {
    if (!networks) return;

    const supportedChains: Chain[] = [];
    const supportedAssets: Asset[] = [];
    for (const [, chainInfo] of Object.entries(networks)) {
      if (chainInfo.networkType !== "mainnet") {
        continue;
      }
      supportedChains.push({
        icon: chainInfo.networkLogo,
        chainId: chainInfo.chainId,
        name: "Ethereum", // TODO: Update this once new field has been created
      });
      for (const asset of chainInfo.assetConfig) {
        supportedAssets.push({
          icon: asset.logo,
          ticker: asset.symbol,
          name: asset.name,
          chainId: chainInfo.chainId,
          decimals: asset.decimals,
        });
      }
    }
    setSupportedChains(supportedChains);
    setSupportedAssets(supportedAssets);

    // Set default assets
    if (supportedAssets.length > 1) {
      setSendAsset(supportedAssets[0]);
      setReceiveAsset(supportedAssets[1]);
    }
  }, [networks]);

  const swapAssets = () => {
    setSendAsset(receiveAsset);
    setReceiveAsset(sendAsset);
  }

  return (
      <div
        className={`bg-white/50 rounded-[20px]
          relative overflow-hidden
          w-full max-w-[424px] mx-auto mt-10
          before:content-[""] before:bg-black before:bg-opacity-0
          before:absolute before:top-0 before:left-0
          before:h-full before:w-full
          before:pointer-events-none before:transition-colors before:duration-700
          ${isPopupOpen && "before:bg-opacity-10"}`}
      >
        <div className="flex flex-col gap-4 p-3 transition-opacity">
          <SwapInput
            type="Send"
            amount={sendAmount}
            asset={sendAsset}
            supportedChains={supportedChains}
            supportedAssets={supportedAssets}
            setAmount={setSendAmount}
            setAsset={setSendAsset}
            setIsPopupOpen={setIsPopupOpen}
          />
        <div
          // TODO: Check why translate is not working
          className="bg-white border border-light-grey rounded-full
        absolute top-[94px] left-1/2 -translate-x-1/2
        p-1.5 cursor-pointer"
          onClick={swapAssets}
        >
          <ExchangeIcon />
        </div>
          <SwapInput
            type="Receive"
            amount={receiveAmount}
            asset={receiveAsset}
            supportedChains={supportedChains}
            supportedAssets={supportedAssets}
            setAmount={setReceiveAmount}
            setAsset={setReceiveAsset}
            setIsPopupOpen={setIsPopupOpen}
          />
          <SwapAddress address={address} setAddress={setAddress} />
          <SwapDetails setIsPopupOpen={setIsPopupOpen} />
          <Button size="lg">Swap</Button>
      </div>
    </div>
  );
};
