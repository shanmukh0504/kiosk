import { evmToViemChainMap } from "@gardenfi/core";
import { EvmChain, isEvmNativeToken } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { createPublicClient, erc20Abi, Hex, http } from "viem";
import { MULTICALL_CONTRACT_ADDRESSES } from "../constants/constants";
import { multicall3Abi } from "../common/abi/multicall3";
import logger from "./logger";
import { getRPCsForChain, getWorkingRPCs } from "./rpcUtils";

export const getBalanceMulticall = async (
  tokenAddresses: Hex[],
  address: Hex,
  chain: EvmChain,
): Promise<Record<string, BigNumber | undefined>> => {
  const viemChain = evmToViemChainMap[chain];
  if (!viemChain || tokenAddresses.length === 0) return {};

  const multicallAddress =
    viemChain.contracts?.multicall3?.address ??
    MULTICALL_CONTRACT_ADDRESSES[viemChain.id];

  if (!multicallAddress) {
    logger.error(
      "multicall contract address doesn't exist for the chain id " +
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
          : viemChain.id === 1
            ? http("https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7")
          : http(),
      chain: viemChain,
    });
    return await fetchBalances(defaultClient);
  } catch {
    // fallback to working RPCs
  }
  const chainRPCs = await getRPCsForChain(viemChain);
  const workingChainRPCs = await getWorkingRPCs(chainRPCs);

  for (const rpcUrl of workingChainRPCs) {
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
