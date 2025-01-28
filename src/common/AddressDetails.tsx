import { Chain, isBitcoin } from "@gardenfi/orderbook";
import { getTrimmedAddress } from "../utils/getTrimmedAddress";
import { FC, useMemo } from "react";
import { assetInfoStore } from "../store/assetInfoStore";
import { ArrowNorthEastIcon, EditIcon } from "@gardenfi/garden-book";
import { Typography } from "@gardenfi/garden-book";
import { useSwap } from "../hooks/useSwap";

type AddressDetailsProps = {
  isRefund?: boolean;
  address?: string;
};

export const AddressDetails: FC<AddressDetailsProps> = ({
  isRefund,
  address,
}) => {
  const { chains } = assetInfoStore();
  const { inputAsset, outputAsset, setIsEditBTCAddress, isEditBTCAddress } =
    useSwap();

  const chain = isRefund
    ? inputAsset && inputAsset.chain
    : outputAsset && outputAsset.chain;

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
          className={`flex justify-between items-center py-0.5 duration-500 ease-in-out transition-all
            ${
              !isEditBTCAddress || (chain && !isBitcoin(chain))
                ? "opacity-100 max-h-7 pointer-events-auto mb-0"
                : "max-h-0 -mb-1 opacity-0 pointer-events-none"
            }`}
        >
          <Typography size="h5" weight="medium">
            {isRefund ? "Refund" : "Receive"} address
          </Typography>
          <div className="flex gap-2.5 items-center">
            <Typography size="h4" weight="medium">
              {getTrimmedAddress(address!)}
            </Typography>
            {!isEditBTCAddress && (
              <EditIcon
                className={`p-0.5 cursor-pointer duration-500 ease-in-out transition-all ${
                  chain && isBitcoin(chain)
                    ? "max-w-4 max-h-4 opacity-100"
                    : "max-w-0 max-h-0 -mr-3.5 opacity-0"
                }`}
                onClick={() => setIsEditBTCAddress(true)}
              />
            )}
            <ArrowNorthEastIcon
              className="w-4 h-4 p-[3px] cursor-pointer"
              onClick={() => handleAddressRedirect(address!, chain!)}
            />
          </div>
        </div>
      )}
    </>
  );
};
