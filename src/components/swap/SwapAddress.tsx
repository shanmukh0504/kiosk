import { useId, useRef, ChangeEvent, FC, useMemo } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Tooltip } from "../../common/Tooltip";
import { swapStore } from "../../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";

type SwapAddressProps = {
  isValidAddress: boolean;
};

export const SwapAddress: FC<SwapAddressProps> = ({ isValidAddress }) => {
  const { inputAsset, outputAsset, btcAddress, setBtcAddress } = swapStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipId = useId();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1)!)) {
      input = input.slice(0, -1);
    }
    setBtcAddress(input);
  };

  const isRecoveryAddress = useMemo(() => inputAsset && isBitcoin(inputAsset.chain), [inputAsset]);
  const isReceiveAddress = useMemo(() => outputAsset && isBitcoin(outputAsset.chain), [outputAsset]);

  return (
    (isRecoveryAddress || isReceiveAddress) && (
      <div className="flex flex-col gap-2 bg-white rounded-2xl p-4 mb-4">
        <Typography
          data-tooltip-id={isRecoveryAddress ? tooltipId : ""}
          size="h5"
          weight="bold"
          onClick={() => inputRef.current!.focus()}
          className="w-fit"
        >
          {isRecoveryAddress ? "Recovery" : "Receive"} address
        </Typography>
        <Typography size="h3" weight="medium">
          <input
            ref={inputRef}
            className={`w-full outline-none placeholder:text-mid-grey ${!isValidAddress ? "text-red-600" : ""
              }`}
            type="text"
            value={btcAddress}
            placeholder="Your Bitcoin address"
            onChange={handleChange}
          />
          {isRecoveryAddress && (
            <Tooltip
              id={tooltipId}
              place="right"
              content="In case your swap expires, your Bitcoin will be automatically refunded to this address."
              multiline={true}
            />
          )}
        </Typography>
      </div>
    )
  );
};
