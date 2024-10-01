import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { useState } from "react";
import { SwapInput } from "./SwapInput";
import { Asset, BTC } from "../../constants/constants";
import { SwapDetails } from "./SwapDetails";
import { SwapAddress } from "./SwapAddress";

export const Swap = () => {
  const [sendAsset, setSendAsset] = useState<Asset | undefined>(BTC);
  const [receiveAsset, setReceiveAsset] = useState<Asset | undefined>();
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const swapAssets = () => {
    setSendAsset(receiveAsset);
    setReceiveAsset(sendAsset);
    setSendAmount(receiveAmount);
    setReceiveAmount(sendAmount);
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
          setAmount={setReceiveAmount}
          setAsset={setReceiveAsset}
          setIsPopupOpen={setIsPopupOpen}
        />
        <SwapAddress sendAsset={sendAsset} receiveAsset={receiveAsset} address={address} setAddress={setAddress} />
        <SwapDetails sendAmount={sendAmount} receiveAmount={receiveAmount} setIsPopupOpen={setIsPopupOpen} />
        <Button size="lg">Swap</Button>
      </div>
    </div>
  );
};
