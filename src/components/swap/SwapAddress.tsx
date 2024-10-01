import { FC, useRef } from "react";
import { Typography } from "@gardenfi/garden-book";
import { Asset } from "../../constants/constants";

type SwapAddressProps = {
  sendAsset: Asset | undefined;
  receiveAsset: Asset | undefined;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
};

export const SwapAddress: FC<SwapAddressProps> = ({ sendAsset, receiveAsset, address, setAddress }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1)!)) {
      input = input.slice(0, -1);
    }
    setAddress(input);
  };

  const isSendBitcoin = sendAsset && sendAsset.ticker === "BTC";
  const isReceiveBitcoin = receiveAsset && receiveAsset.ticker === "BTC";

  return (
    (isSendBitcoin || isReceiveBitcoin) &&
    <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
      <Typography
        size="h5"
        weight="bold"
        onClick={() => inputRef.current!.focus()}
      >
        {isSendBitcoin ? "Recovery" : "Receive"} address
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
    </div>
  );
};
