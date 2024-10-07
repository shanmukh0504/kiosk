import { FC, useId, useRef } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Asset } from "../../constants/constants";
import { Tooltip } from "../../common/Tooltip";

type SwapAddressProps = {
  sendAsset: Asset | undefined;
  receiveAsset: Asset | undefined;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
};

export const SwapAddress: FC<SwapAddressProps> = ({ sendAsset, receiveAsset, address, setAddress }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1)!)) {
      input = input.slice(0, -1);
    }
    setAddress(input);
  };

  const isRecoveryAddress = sendAsset?.ticker === "BTC";
  const isReceiveAddress = receiveAsset?.ticker === "BTC";

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
          // TODO: Check why the placeholder color is not working
          className="w-full outline-none placeholder:text-mid-grey"
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
