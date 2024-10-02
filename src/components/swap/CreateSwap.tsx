import { Button, ExchangeIcon } from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { SwapInput } from "./SwapInput";
import { Asset, BTC, SwapDetails } from "../../constants/constants";
import { SwapFees } from "./SwapFees";
import { SwapAddress } from "./SwapAddress";

type CreateSwapProps = {
    swap: SwapDetails | undefined;
    createSwap: (swap: SwapDetails) => void;
};

export const CreateSwap: FC<CreateSwapProps> = ({ swap, createSwap }) => {
    const [sendAsset, setSendAsset] = useState<Asset | undefined>(swap ? swap.sendAsset : BTC);
    const [receiveAsset, setReceiveAsset] = useState<Asset | undefined>(swap?.receiveAsset);
    const [sendAmount, setSendAmount] = useState(swap?.sendAmount || "");
    const [receiveAmount, setReceiveAmount] = useState(swap?.receiveAmount || "");
    const [address, setAddress] = useState(swap?.address || "");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const validSwap = sendAsset && receiveAsset && sendAmount && receiveAmount && address;

    const swapAssets = () => {
        setSendAsset(receiveAsset);
        setReceiveAsset(sendAsset);
        setSendAmount(receiveAmount);
        setReceiveAmount(sendAmount);
    }

    return (
        <div
            className={`before:content-[""] before:bg-black before:bg-opacity-0
          before:absolute before:top-0 before:left-0
          before:h-full before:w-full
          before:pointer-events-none before:transition-colors before:duration-700
          ${isPopupOpen && "before:bg-opacity-10"}`}
        >
            <div className="flex flex-col gap-4 p-3">
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
                <SwapAddress
                    sendAsset={sendAsset}
                    receiveAsset={receiveAsset}
                    address={address}
                    setAddress={setAddress}
                />
                {validSwap &&
                    <SwapFees
                        swap={{
                            sendAsset,
                            receiveAsset,
                            sendAmount,
                            receiveAmount,
                            address,
                        }}
                        setIsPopupOpen={setIsPopupOpen}
                    />
                }
                <Button
                    className="transition-colors duration-500"
                    variant={validSwap ? "primary" : "disabled"}
                    size="lg"
                    onClick={() => validSwap && createSwap({
                        sendAsset,
                        receiveAsset,
                        sendAmount,
                        receiveAmount,
                        address,
                    })}
                >
                    Swap
                </Button>
            </div>
        </div>
    );
};
