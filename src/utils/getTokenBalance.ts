import { evmToViemChainMap } from "@gardenfi/core";
import {
  Asset,
  isBitcoin,
  isEVM,
  isEvmNativeToken,
  isStarknet,
} from "@gardenfi/orderbook";
import { with0x } from "@gardenfi/utils";
import BigNumber from "bignumber.js";
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
} from "viem";
import { formatAmount } from "./utils";
import { RpcProvider, Contract } from "starknet";
import { STARKNET_CONFIG } from "@gardenfi/core";
import { network } from "../constants/constants";

const erc20ABI = [
  {
    members: [
      {
        name: "low",
        offset: 0,
        type: "felt",
      },
      {
        name: "high",
        offset: 1,
        type: "felt",
      },
    ],
    name: "Uint256",
    size: 2,
    type: "struct",
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const getStarknetTokenBalance = async (
  address: string,
  asset: Asset
) => {
  if (!isStarknet(asset.chain)) return 0;

  try {
    const provider = new RpcProvider({
      nodeUrl: STARKNET_CONFIG[network].nodeUrl,
    });

    const erc20Contract = new Contract(erc20ABI, asset.tokenAddress, provider);

    const balance = await erc20Contract.balanceOf(address);
    if (!balance) return 0;
    const lowValue = balance.balance.low.toString();
    const highValue = balance.balance.high.toString();

    // Convert hex strings to BigNumber
    const low = new BigNumber(lowValue);
    const high = new BigNumber(highValue);

    // Calculate total value: low + (high << 128)
    const shift128 = new BigNumber(2).pow(128);
    const totalBalance = low.plus(high.multipliedBy(shift128));

    const balanceInDecimals = formatAmount(
      Number(totalBalance),
      asset.decimals,
      8
    );
    return balanceInDecimals;
  } catch (error) {
    console.error("Error fetching Starknet balance:", error);
    return 0;
  }
};

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
  let _chain = evmToViemChainMap[asset.chain];
  if (!_chain) return 0;

  if (_chain.id === 1) {
    const updatedChain = {
      ..._chain,
      rpcUrls: {
        default: {
          http: ["https://eth-mainnet.public.blastapi.io"],
        },
      },
    };
    _chain = updatedChain;
  }

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
