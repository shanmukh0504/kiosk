import { FC } from "react";
import { Typography } from "@gardenfi/garden-book";

type SwapAddressProps = {
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
};

export const SwapAddress: FC<SwapAddressProps> = ({ address, setAddress }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!/^[a-zA-Z0-9]$/.test(input.at(-1)!)) {
      input = input.slice(0, -1);
    }
    setAddress(input);
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-2xl p-4">
      <Typography size="h5" weight="bold">
        Refund address
      </Typography>
      <Typography size="h3" weight="medium">
        <input
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
