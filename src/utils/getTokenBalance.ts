import { evmToViemChainMap } from "@gardenfi/core";
import { Asset, isBitcoin, isEVM, isEvmNativeToken } from "@gardenfi/orderbook";
import { with0x } from "@gardenfi/utils";
import BigNumber from "bignumber.js";
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
} from "viem";
import { formatAmount } from "./utils";

export const getTokenBalance = async (address: string, asset: Asset) => {
  if (isEvmNativeToken(asset.chain, asset.tokenAddress))
    return getNativeBalance(address, asset);

  const balanceOfABI = {
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  };

  if (isBitcoin(asset.chain) || !isEVM(asset.chain)) return 0;
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

export const getNativeBalance = async (address: string, asset: Asset) => {
  try {
    if (
      isBitcoin(asset.chain) ||
      !isEVM(asset.chain) ||
      !isEvmNativeToken(asset.chain, asset.tokenAddress)
    )
      return 0;
    const _chain = evmToViemChainMap[asset.chain];
    if (!_chain) return 0;

    const publicClient = createPublicClient({
      chain: _chain,
      transport: http(),
    });

    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    const balanceInDecimals = formatAmount(balance, asset.decimals, 8);

    return balanceInDecimals;
  } catch {
    return 0;
  }
};
