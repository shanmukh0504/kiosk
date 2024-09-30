import { Button, Typography } from "@gardenfi/garden-book";
import { useState } from "react";
import { useConnect } from "wagmi";
import { SwapInput } from "./SwapInput";
import { SupportedAssets } from "../../constants/constants";

export const Swap = () => {
  const { connectors, connect } = useConnect();
  const [sendAsset, setSendAsset] = useState(SupportedAssets.BTC);
  const [receiveAsset, setReceiveAsset] = useState(SupportedAssets.WBTC);
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [isAssetSelectorVisible, setIsAssetSelectorVisible] = useState(false);

  const fadeOutClass = `${isAssetSelectorVisible && "opacity-40"} transition-opacity duration-500`;

  return (
    <div className="flex flex-col">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
      <div
        className={`bg-white/50 rounded-[20px] relative overflow-hidden w-full max-w-[424px] mx-auto`}
      >
        <div className={`flex flex-col gap-4 p-3 transition-opacity`}>
          <SwapInput
            type="Send"
            amount={sendAmount}
            asset={sendAsset}
            fadeOutClass={fadeOutClass}
            setAmount={setSendAmount}
            setAsset={setSendAsset}
            setIsAssetSelectorVisible={setIsAssetSelectorVisible}
          />
          <SwapInput
            type="Receive"
            amount={receiveAmount}
            asset={receiveAsset}
            fadeOutClass={fadeOutClass}
            setAmount={setReceiveAmount}
            setAsset={setReceiveAsset}
            setIsAssetSelectorVisible={setIsAssetSelectorVisible}
          />
          <div
            className={`flex flex-col gap-2 bg-white rounded-2xl p-4 ${fadeOutClass}`}
          >
            <Typography size="h5" weight="bold">
              Refund address
            </Typography>
            <Typography size="h3" weight="medium">
              <input
                // TODO: Check why the placeholder is not working
                className="flex-grow outline-none placeholder:text-mid-grey"
                type="text"
                placeholder="Your Bitcoin address"
              />
            </Typography>
          </div>
          <div
            className={`flex flex-col gap-2 bg-white/50 rounded-2xl p-4 ${fadeOutClass}`}
          >
            <Typography size="h5" weight="bold">
              Fees
            </Typography>
            <Typography size="h3" weight="bold">
              0.0003256 BTC
            </Typography>
          </div>
          <Button className={fadeOutClass} size="lg">
            Swap
          </Button>
        </div>
      </div>
    </div>
  );
};
