import { Button, Typography } from "@gardenfi/garden-book";
import { useState } from "react";
import { useConnect } from "wagmi";
import { SwapInput } from "./SwapInput";
import { AssetSelector } from "./AssetSelector";

export const Swap = () => {
  const { connectors, connect } = useConnect();
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  return (
    <div className="flex flex-col">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
      <div className="relative bg-white/50 rounded-[20px] w-full max-w-[424px] mx-auto p-3 overflow-hidden">
        <AssetSelector
          visible={showAssetSelector}
          hide={() => setShowAssetSelector(false)}
        />
        <div
          className={`${showAssetSelector && "opacity-0"} flex flex-col gap-4 transition-opacity`}
        >
          <SwapInput
            type="Send"
            amount={sendAmount}
            onChange={setSendAmount}
            setShowAssetSelector={setShowAssetSelector}
          />
          <SwapInput
            type="Receive"
            amount={receiveAmount}
            onChange={setReceiveAmount}
            setShowAssetSelector={setShowAssetSelector}
          />
          <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
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
          <div className="flex flex-col gap-2 bg-white/50 rounded-2xl p-4">
            <Typography size="h5" weight="bold">
              Fees
            </Typography>
            <Typography size="h3" weight="bold">
              0.0003256 BTC
            </Typography>
          </div>
          <Button size="lg">Swap</Button>
        </div>
      </div>
    </div>
  );
};
