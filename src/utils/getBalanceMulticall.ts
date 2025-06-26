import { evmToViemChainMap } from "@gardenfi/core";
import { EvmChain, isBitcoin } from "@gardenfi/orderbook";
import BigNumber from "bignumber.js";
import { createPublicClient, erc20Abi, http } from "viem";
import { rpcStore } from "../store/rpcStore";

export const getBalanceMulticall = async (
  tokenAddresses: string[],
  address: string,
  chain: EvmChain
): Promise<Record<string, BigNumber | undefined>> => {
  const { workingRPCs } = rpcStore.getState();

  const viemChain = evmToViemChainMap[chain];
  if (!viemChain || tokenAddresses.length === 0) return {};

  const supportsMulticall = viemChain.id !== 5115;

  const initializeEmptyResult = () => {
    return tokenAddresses.reduce(
      (acc, tokenAddress) => {
        acc[tokenAddress] = isBitcoin(chain) ? undefined : new BigNumber(0);
        return acc;
      },
      {} as Record<string, BigNumber | undefined>
    );
  };

  const fetchBalances = async (
    client: ReturnType<typeof createPublicClient>
  ) => {
    if (supportsMulticall) {
      const calls = tokenAddresses
        .filter((token) => token !== "primary")
        .map((token) => ({
          address: token as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }));

      const result = await client.multicall({ contracts: calls });
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
    } else {
      const token = tokenAddresses[0] as `0x${string}`;
      const balance = await client.readContract({
        address: token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      return { [token]: new BigNumber(balance.toString()) };
    }
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
    console.log(`Using fallback RPC: ${rpcUrl} for chain ${viemChain.id}`);
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
  return initializeEmptyResult();
};
