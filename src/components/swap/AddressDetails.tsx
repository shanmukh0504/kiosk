import { isBitcoin } from "@gardenfi/orderbook";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useMemo, useId, FC } from "react";
import { assetInfoStore } from "../../store/assetInfoStore";
import {
  ArrowNorthEastIcon,
  EditIcon,
  Typography,
} from "@gardenfi/garden-book";
import { Tooltip } from "../../common/Tooltip";
import { swapStore } from "../../store/swapStore";
import { Url } from "@gardenfi/utils";

type AddressDetailsProps = {
  isRefund?: boolean;
  address: string;
};

export const AddressDetails: FC<AddressDetailsProps> = ({
  isRefund,
  address,
}) => {
  const { chains } = assetInfoStore();
  const tooltipId = useId();
  const { inputAsset, outputAsset, isEditAddress } = swapStore();
  const { setIsEditAddress } = swapStore();

  const chain = useMemo(() => {
    return isRefund
      ? inputAsset && inputAsset.chain
      : outputAsset && outputAsset.chain;
  }, [inputAsset, outputAsset, isRefund]);

  const redirect = useMemo(() => {
    return chains && chain ? chains[chain] : null;
  }, [chains, chain]);

  const handleAddressRedirect = (address: string) => {
    if (!redirect) return;
    const url = new Url("address", redirect.explorer_url).endpoint(address);
    window.open(url, "_blank");
  };

  const isEditing = isRefund ? isEditAddress.source : isEditAddress.destination;

  return (
    <>
      {address && chain && (
        <div
          className={`flex cursor-pointer items-center justify-between px-4 transition-all duration-200 ease-in-out hover:bg-white ${
            !isEditing || (chain && !isBitcoin(chain))
              ? "pointer-events-auto max-h-7 py-1 opacity-100"
              : "pointer-events-none max-h-0 py-0 opacity-0"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleAddressRedirect(address);
          }}
        >
          <Typography
            data-tooltip-id={isRefund ? tooltipId : ""}
            size="h5"
            weight="regular"
            className="!text-mid-grey"
          >
            {isRefund ? "Refund" : "Receive"} address
          </Typography>
          <div className="flex items-center gap-2">
            <Typography size="h5" weight="regular">
              {getTrimmedAddress(address)}
            </Typography>
            <div className="flex gap-1">
              {!isEditing && (
                <EditIcon
                  className={`cursor-pointer p-0.5 transition-all duration-500 ease-in-out ${
                    chain && isBitcoin(chain)
                      ? "max-h-4 max-w-4 opacity-100"
                      : "-mr-3.5 max-h-0 max-w-0 opacity-0"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditAddress({
                      source: isRefund ? true : isEditAddress.source,
                      destination: isRefund ? isEditAddress.destination : true,
                    });
                  }}
                />
              )}
              <ArrowNorthEastIcon className="h-4 w-4 cursor-pointer p-[3px]" />
            </div>
          </div>
        </div>
      )}
      <Typography size="h5" weight="regular">
        {isRefund && (
          <Tooltip
            id={tooltipId}
            place="right"
            content="If the swap expires, your Bitcoin will be refunded to this address."
            multiline={true}
          />
        )}
      </Typography>
    </>
  );
};
