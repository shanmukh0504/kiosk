import { FC } from "react";
import { useState } from "react";
import { Tooltip } from "../../../common/Tooltip";
import { useId } from "react";
import { Typography } from "@gardenfi/garden-book";
import { getTrimmedAddress } from "../../../utils/getTrimmedAddress";

type AddressProps = {
  address: string;
  logo: string;
};

export const Address: FC<AddressProps> = ({ address, logo }) => {
  const [addressTooltipContent, setAddressTooltipContent] = useState("Copy");
  const addressTooltipId = useId();

  const handleAddressClick = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setAddressTooltipContent("Copied");
    }
    setTimeout(() => {
      setAddressTooltipContent("Copy");
    }, 2000);
  };

  return (
    <div className="flex gap-2 rounded-full bg-white/50 px-2 py-[2px]">
      <img src={logo} className="my-1 h-5 w-5" />
      <Typography
        size="h3"
        weight="medium"
        className="cursor-pointer pt-[2px]"
        onClick={handleAddressClick}
        data-tooltip-id={addressTooltipId}
      >
        {getTrimmedAddress(address)}
      </Typography>
      <Tooltip
        id={addressTooltipId}
        place="top"
        content={addressTooltipContent}
      />
    </div>
  );
};
