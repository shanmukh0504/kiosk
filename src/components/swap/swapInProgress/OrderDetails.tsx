import {
  ArrowNorthEastIcon,
  KeyboardDownIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useState, FC, useMemo } from "react";
import { getTrimmedAddress } from "../../../utils/getTrimmedAddress";
import { isBitcoin, MatchedOrder } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { getAssetFromSwap } from "../../../utils/utils";
import { assetInfoStore } from "../../../store/assetInfoStore";
import { CopyToClipboard } from "../../../common/CopyToClipboard";

type OrderDetailsProps = {
  order: MatchedOrder;
};

type OrderDetailsRowProps = {
  title: string;
  value: string;
  copyString?: string;
  link?: string;
};

export const OrderDetailsRow: FC<OrderDetailsRowProps> = ({
  title,
  value,
  copyString,
  link,
}) => {
  const handleClickAddress = () => {
    if (link) window.open(link, "_blank");
  };

  return (
    <div className="flex justify-between">
      <Typography size="h4" weight="medium">
        {title}
      </Typography>
      <div className="flex items-center gap-2">
        <Typography size="h4" weight="medium">
          {link ? getTrimmedAddress(value) : value}
        </Typography>
        {copyString && <CopyToClipboard text={copyString} />}
        {link && (
          <ArrowNorthEastIcon
            className="h-[10px] w-[10px] cursor-pointer"
            onClick={handleClickAddress}
          />
        )}
      </div>
    </div>
  );
};

export const OrderDetails: FC<OrderDetailsProps> = ({ order }) => {
  const [dropdown, setDropdown] = useState(false);
  const { assets, chains } = assetInfoStore();

  const { inputAsset, outputAsset, btcAddress } = useMemo(() => {
    return {
      depositAddress:
        order && isBitcoin(order?.source_swap.chain)
          ? order.source_swap.swap_id
          : "",
      inputAsset: order && getAssetFromSwap(order.source_swap, assets),
      outputAsset: order && getAssetFromSwap(order.destination_swap, assets),
      btcAddress: order
        ? order.create_order.additional_data.bitcoin_optional_recipient
        : "",
    };
  }, [assets, order]);

  const link =
    order &&
    chains &&
    chains[
      isBitcoin(order.source_swap.chain)
        ? order.source_swap.chain
        : order.destination_swap.chain
    ]?.explorer +
      "address/" +
      btcAddress;

  const { inputAmountPrice, outputAmountPrice, amountToFill, filledAmount } =
    useMemo(() => {
      return {
        inputAmountPrice: order
          ? new BigNumber(order.source_swap.amount)
              .dividedBy(10 ** (inputAsset?.decimals ?? 0))
              .multipliedBy(
                order.create_order.additional_data.input_token_price
              )
          : new BigNumber(0),
        outputAmountPrice: order
          ? new BigNumber(order.destination_swap.amount)
              .dividedBy(10 ** (outputAsset?.decimals ?? 0))
              .multipliedBy(
                order.create_order.additional_data.output_token_price
              )
          : new BigNumber(0),
        amountToFill: order
          ? Number(
              new BigNumber(order.source_swap.amount)
                .dividedBy(10 ** (inputAsset?.decimals ?? 0))
                .toFixed(inputAsset?.decimals ?? 0)
            )
          : 0,
        filledAmount: order
          ? Number(
              new BigNumber(order.source_swap.filled_amount)
                .dividedBy(10 ** (inputAsset?.decimals ?? 0))
                .toFixed(inputAsset?.decimals ?? 0)
            )
          : 0,
      };
    }, [inputAsset, order, outputAsset]);

  const fees = BigNumber.maximum(
    inputAmountPrice.minus(outputAmountPrice),
    0
  ).toFixed(3);

  const handleDropdown = () => setDropdown(!dropdown);

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white/50 p-4">
      <div
        onClick={handleDropdown}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div
          className={`transform transition-transform duration-300 ${
            dropdown ? "rotate-180" : "rotate-0"
          }`}
        >
          <KeyboardDownIcon />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          dropdown ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-2 flex flex-col gap-3 rounded-2xl">
          <OrderDetailsRow title="Fee" value={`$${fees}`} />
          <OrderDetailsRow
            title="Amount"
            value={`${filledAmount} / ${amountToFill} ${inputAsset?.symbol}`}
          />
          <OrderDetailsRow
            title="Order ID"
            value={getTrimmedAddress(order.create_order.create_id)}
            copyString={order.create_order.create_id}
          />
          {inputAsset && btcAddress && link && (
            <OrderDetailsRow
              title={
                isBitcoin(inputAsset.chain)
                  ? "Recovery"
                  : "Receive" + " address"
              }
              value={btcAddress}
              link={link}
            />
          )}
        </div>
      </div>
    </div>
  );
};
