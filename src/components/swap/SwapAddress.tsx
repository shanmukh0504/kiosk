import { useId, useRef } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Tooltip } from "../../common/Tooltip";
import { swapStore } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";

export const SwapAddress = () => {
  const { inputAsset, outputAsset, btcAddress, setBtcAddress } = swapStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1)!)) {
      input = input.slice(0, -1);
    }
    setBtcAddress(input);
  };

  const isRecoveryAddress = inputAsset && isBitcoin(inputAsset.chain);
  const isReceiveAddress = outputAsset && isBitcoin(outputAsset.chain);

  return (
    (isRecoveryAddress || isReceiveAddress) &&
    <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
      <Typography
        data-tooltip-id={isRecoveryAddress ? tooltipId : ""}
        size="h5"
        weight="bold"
        onClick={() => inputRef.current!.focus()}
      >
        {isRecoveryAddress ? "Recovery" : "Receive"} address
      </Typography>
      <Typography size="h3" weight="medium">
        <input
          ref={inputRef}
          className="w-full focus:outline-none placeholder:text-mid-grey"
          type="text"
          value={address}
          placeholder="Your Bitcoin address"
          onChange={handleChange}
        />
      </Typography>
      <Tooltip
        id={tooltipId}
        place="right"
        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        multiline={true}
      />
    </div>
  );
};
