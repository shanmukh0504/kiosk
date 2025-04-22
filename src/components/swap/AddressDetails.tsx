import { Chain, isBitcoin } from "@gardenfi/orderbook";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { FC, useId, useMemo } from "react";
import { assetInfoStore } from "../../store/assetInfoStore";
import { ArrowNorthEastIcon, EditIcon } from "@gardenfi/garden-book";
import { Typography } from "@gardenfi/garden-book";
import { useSwap } from "../../hooks/useSwap";
import { Tooltip } from "../../common/Tooltip";

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
  const { inputAsset, outputAsset, setIsEditBTCAddress, isEditBTCAddress } =
    useSwap();

  const chain = useMemo(() => {
    return isRefund
      ? inputAsset && inputAsset.chain
      : outputAsset && outputAsset.chain;
  }, [inputAsset, outputAsset, isRefund]);

  const redirect = useMemo(() => {
    return chains && chain ? chains[chain] : null;
  }, [chains, chain]);

  const handleAddressRedirect = (address: string, chain: Chain) => {
    if (!redirect) return;
    if (isBitcoin(chain))
      window.open(redirect.explorer + "address/" + address, "_blank");
    else window.open(redirect.explorer + "/address/" + address, "_blank");
  };

  return (
    <>
      {address && (
        <div
          className={`flex items-center justify-between py-1 transition-all duration-500 ease-in-out ${
            !isEditBTCAddress || (chain && !isBitcoin(chain))
              ? "pointer-events-auto max-h-7 opacity-100"
              : "pointer-events-none max-h-0 py-0 opacity-0"
          }`}
        >
          <Typography
            data-tooltip-id={isRefund ? tooltipId : ""}
            size="h5"
            weight="medium"
          >
            {isRefund ? "Refund" : "Receive"} address
          </Typography>
          <div className="flex items-center gap-2.5">
            <Typography size="h4" weight="medium">
              {getTrimmedAddress(address!)}
            </Typography>
            {!isEditBTCAddress && (
              <EditIcon
                className={`cursor-pointer p-0.5 transition-all duration-500 ease-in-out ${
                  chain && isBitcoin(chain)
                    ? "max-h-4 max-w-4 opacity-100"
                    : "-mr-3.5 max-h-0 max-w-0 opacity-0"
                }`}
                onClick={() => setIsEditBTCAddress(true)}
              />
            )}
            <ArrowNorthEastIcon
              className="h-4 w-4 cursor-pointer p-[3px]"
              onClick={() => handleAddressRedirect(address!, chain!)}
            />
          </div>
        </div>
      )}
      <Typography size="h5" weight="medium">
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
