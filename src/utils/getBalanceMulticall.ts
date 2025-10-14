import { evmToViemChainMap } from "@gardenfi/core";
import { EVMChains, isEVM } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { createPublicClient, erc20Abi, Hex, http } from "viem";
import { MULTICALL_CONTRACT_ADDRESSES } from "../constants/constants";
import { multicall3Abi } from "../common/abi/multicall3";
import logger from "./logger";

export const getBalanceMulticall = async (
  tokenAddresses: Hex[],
  address: Hex,
  chain: EVMChains,
  workingRPCs: Record<number, string[]>,
  assetKeys?: string[]
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
      isEVM(chain) && token === undefined
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
        const key = assetKeys?.[index];
        if (!key) return acc;
        acc[key] =
          call.status === "success"
            ? new BigNumber(call.result.toString())
            : new BigNumber(0);
        return acc;
      },
      {} as Record<string, BigNumber>
    );
  };

  const getDefaultRpcUrl = (): string => {
    switch (viemChain.id) {
      case 80094:
      case 80084:
        return "https://rpc.berachain-apis.com";
      case 1:
        return "https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7";
      default:
        return viemChain.rpcUrls.default.http[0];
    }
  };
  const chainRpcs = workingRPCs[viemChain.id] ?? [];
  for (const rpcUrl of chainRpcs) {
    try {
      const defaultClient = createPublicClient({
        transport: http(rpcUrl),
        chain: viemChain,
      });
      return await fetchBalances(defaultClient);
    } catch {
      // continue to next fallback
    }
  }

  try {
    const defaultRpcUrl = getDefaultRpcUrl();
    const defaultClient = createPublicClient({
      transport: http(defaultRpcUrl),
      chain: viemChain,
    });
    return await fetchBalances(defaultClient);
  } catch {
    return {};
  }
};
