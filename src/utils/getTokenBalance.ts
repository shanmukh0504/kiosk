import { evmToViemChainMap } from "@gardenfi/core";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { with0x } from "@gardenfi/utils";
import BigNumber from "bignumber.js";
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
} from "viem";

export const getTokenBalance = async (address: string, asset: Asset) => {
  const balanceOfABI = {
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  };

  if (isBitcoin(asset.chain)) return 0;
  const _chain = evmToViemChainMap[asset.chain];
  if (!_chain) return 0;

  const data = encodeFunctionData({
    abi: [balanceOfABI],
    functionName: "balanceOf",
    args: [address],
  });

  const publicClient = createPublicClient({
    chain: _chain,
    transport: http(),
  });

  try {
    const result = await publicClient.call({
      to: with0x(asset.tokenAddress),
      data,
    });
    if (!result.data) return 0;

    // Decode the result to get the balance
    const balance = decodeFunctionResult({
      abi: [balanceOfABI],
      functionName: "balanceOf",
      data: result.data,
    });

    const balanceInDecimals = new BigNumber(balance as string)
      .dividedBy(10 ** asset.decimals)
      .toNumber();

    return balanceInDecimals;
  } catch (e) {
    console.log(e);
    return 0;
  }
};
