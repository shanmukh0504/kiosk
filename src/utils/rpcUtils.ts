/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { Chain } from "wagmi/chains";

type RPCValidationResult = {
  url: string;
  isWorking: boolean;
  blockNumber?: number;
  responseTime?: number;
};

type WorkingRPCResult = {
  [chainId: number]: string[];
};

export const testRPC = async (
  rpcUrl: string,
  timeoutMs: number = 5000
): Promise<RPCValidationResult> => {
  const startTime = Date.now();

  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      },
      {
        timeout: timeoutMs,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseTime = Date.now() - startTime;

    const { result } = response.data;
    if (typeof result === "string" && result.startsWith("0x")) {
      return {
        url: rpcUrl,
        isWorking: true,
        blockNumber: parseInt(result, 16),
        responseTime,
      };
    }

    return { url: rpcUrl, isWorking: false };
  } catch {
    return { url: rpcUrl, isWorking: false };
  }
};

export const getChainlistRPCs = async (chainId: number): Promise<string[]> => {
  try {
    const { data } = await axios.get("https://chainlist.org/rpcs.json");
    const entry = data.find((c: any) => c.chainId === chainId);
    return entry?.rpc?.map((rpcObj: any) => rpcObj.url).filter(Boolean) || [];
  } catch (error) {
    console.error("Failed to fetch RPCs:", error);
    return [];
  }
};

export const getWorkingRPCs = async (
  rpcs: string[],
  maxWorking: number = 5,
  maxConcurrent: number = 10
): Promise<string[]> => {
  if (rpcs.length === 0) return [];

  const workingRPCs: string[] = [];

  for (
    let i = 0;
    i < rpcs.length && workingRPCs.length < maxWorking;
    i += maxConcurrent
  ) {
    const batch = rpcs.slice(i, i + maxConcurrent);
    const results = await Promise.all(batch.map((rpc) => testRPC(rpc)));

    const sorted = results
      .filter((res) => res.isWorking)
      .sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0));

    for (const { url } of sorted) {
      if (workingRPCs.length >= maxWorking) break;
      workingRPCs.push(url);
    }
  }

  return workingRPCs;
};

export const getAllWorkingRPCs = async (
  supportedChains: Chain[],
  maxRPCsPerChain: number = 5
): Promise<WorkingRPCResult> => {
  const result: WorkingRPCResult = {};
  const maxConcurrentChains = 3;

  for (let i = 0; i < supportedChains.length; i += maxConcurrentChains) {
    const chainBatch = supportedChains.slice(i, i + maxConcurrentChains);

    const chainPromises = chainBatch.map(async (chain) => {
      const chainId = chain.id;

      try {
        const allRPCs = await getChainlistRPCs(chainId);
        if (allRPCs.length === 0) return { chainId, workingRPCs: [] };

        const workingRPCs = await getWorkingRPCs(allRPCs, maxRPCsPerChain);
        return { chainId, workingRPCs };
      } catch {
        return { chainId, workingRPCs: [] };
      }
    });

    const batchResults = await Promise.all(chainPromises);
    batchResults.forEach(({ chainId, workingRPCs }) => {
      result[chainId] = workingRPCs;
    });
  }
  console.log("Working RPCs:", result);
  return result;
};
