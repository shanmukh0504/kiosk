import { Button } from "@gardenfi/garden-book";
import { useState } from "react";
import { SwapInput } from "./SwapInput";
import { SupportedAssets } from "../../constants/constants";
import { SwapDetails } from "./SwapDetails";
import { SwapAddress } from "./SwapAddress";

export const Swap = () => {
  const [sendAsset, setSendAsset] = useState(SupportedAssets.BTC);
  const [receiveAsset, setReceiveAsset] = useState(SupportedAssets.WBTC);
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div
        className={`bg-white/50 rounded-[20px]
          relative overflow-hidden
          w-full max-w-[424px] mx-auto
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
            setAmount={setSendAmount}
            setAsset={setSendAsset}
            setIsPopupOpen={setIsPopupOpen}
          />
          <SwapInput
            type="Receive"
            amount={receiveAmount}
            asset={receiveAsset}
            setAmount={setReceiveAmount}
            setAsset={setReceiveAsset}
            setIsPopupOpen={setIsPopupOpen}
          />
          <SwapAddress address={address} setAddress={setAddress} />
          <SwapDetails setIsPopupOpen={setIsPopupOpen} />
          <Button size="lg">Swap</Button>
        </div>
      </div>
    </div>
  );
};
