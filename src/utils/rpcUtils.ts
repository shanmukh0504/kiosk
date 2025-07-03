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
  timeoutMs: number = 1000
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

type ChainListRPC = {
  [chainId: number]: string[];
};

export const getChainListRPCs = async (): Promise<ChainListRPC> => {
  try {
    const { data } = await axios.get<
      {
        chainId: number;
        rpc: { url: string }[];
      }[]
    >("https://chainlist.org/rpcs.json");

    return data.reduce((acc, curr) => {
      acc[curr.chainId] = curr.rpc.map((rpc) => rpc.url);
      return acc;
    }, {} as ChainListRPC);
  } catch {
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
  const rpcs = await getChainListRPCs();

  const workingRPCsPromises = supportedChains.map(async (chain) => {
    const reqRPCs = rpcs[chain.id];
    let workingRPCs: string[];

    if (!reqRPCs || reqRPCs.length === 0) {
      workingRPCs = [chain.rpcUrls.default.http[0]];
    } else {
      workingRPCs = await getWorkingRPCs(reqRPCs, maxRPCsPerChain);
    }

    return { chainId: chain.id, workingRPCs };
  });

  const workingRPCsResults = await Promise.all(workingRPCsPromises);

  for (const { chainId, workingRPCs } of workingRPCsResults) {
    result[chainId] = workingRPCs;
  }

  return result;
};
