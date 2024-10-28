import { useEffect } from "react";
import { swapStore } from "../store/swapStore";
import { IOType } from "../constants/constants";
// import { assetInfoStore } from "../store/assetInfoStore";
// import { constructOrderPair } from "@gardenfi/core";
// import BigNumber from "bignumber.js";

export const useSwap = () => {
  const { inputAmount, outputAmount, inputAsset, outputAsset, setAmount } =
    swapStore();
  // const { strategies } = assetInfoStore();

  // const swapLimits =
  //   inputAsset &&
  //   outputAsset &&
  //   strategies.val &&
  //   strategies.val[
  //     constructOrderPair(
  //       inputAsset.chain,
  //       inputAsset.atomicSwapAddress,
  //       outputAsset.chain,
  //       outputAsset.atomicSwapAddress
  //     )
  //   ];
  // const minAmount =
  //   swapLimits &&
  //   inputAsset &&
  //   new BigNumber(swapLimits.minAmount)
  //     .dividedBy(10 ** inputAsset.decimals)
  //     .toNumber();
  // const maxAmount =
  //   swapLimits &&
  //   inputAsset &&
  //   new BigNumber(swapLimits.maxAmount)
  //     .dividedBy(10 ** inputAsset.decimals)
  //     .toNumber();

  // Reset the input and output amounts when the input or output asset changes.
  useEffect(() => {
    setAmount(IOType.input, "0");
    setAmount(IOType.output, "0");
  }, [inputAsset, outputAsset]);

  return {
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
  };
};
