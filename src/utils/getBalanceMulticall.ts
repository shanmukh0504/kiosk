import { evmToViemChainMap } from "@gardenfi/core";
import { EvmChain, isEvmNativeToken } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { createPublicClient, erc20Abi, Hex, http } from "viem";
import { MULTICALL_CONTRACT_ADDRESSES } from "../constants/constants";
import { multicall3Abi } from "../common/abi/multicall3";

export const getBalanceMulticall = async (
  tokenAddresses: Hex[],
  address: Hex,
  chain: EvmChain,
  workingRPCs: Record<number, string[]>
): Promise<Record<string, BigNumber | undefined>> => {
  const viemChain = evmToViemChainMap[chain];
  if (!viemChain || tokenAddresses.length === 0) return {};

  const multicallAddress =
    viemChain.contracts?.multicall3?.address ??
    MULTICALL_CONTRACT_ADDRESSES[viemChain.id];

  if (!multicallAddress) {
    console.error(
      "multicall contract address doesn't exist for the chain id ",
      viemChain.id
    );
    throw Error("multicall contract address doesn't exist.");
  }

  const fetchBalances = async (
    client: ReturnType<typeof createPublicClient>
  ) => {
    const calls = tokenAddresses.map((token) =>
      isEvmNativeToken(chain, token)
        ? {
            address: multicallAddress as Hex,
            abi: multicall3Abi,
            functionName: "getEthBalance" as const,
            args: [address],
          }
        : {
            address: token,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address],
          }
    );

    const result = await client.multicall({
      contracts: calls,
      multicallAddress: multicallAddress as Hex,
    });

    return result.reduce(
      (acc, call, index) => {
        acc[tokenAddresses[index]] =
          call.status === "success"
            ? new BigNumber(call.result.toString())
            : new BigNumber(0);
        return acc;
      },
      {} as Record<string, BigNumber>
    );
  };

  try {
    const defaultClient = createPublicClient({
      transport:
        viemChain.id === 80094 || viemChain.id === 80084
          ? http("https://rpc.berachain-apis.com")
          : http(),
      chain: viemChain,
    });
    return await fetchBalances(defaultClient);
  } catch {
    // fallback to working RPCs
  }

  const fallbacks = workingRPCs[viemChain.id] || [];
  for (const rpcUrl of fallbacks) {
    try {
      const fallbackClient = createPublicClient({
        transport: http(rpcUrl),
        chain: viemChain,
      });
      return await fetchBalances(fallbackClient);
    } catch {
      // continue to next fallback
    }
  }
  return {};
};
