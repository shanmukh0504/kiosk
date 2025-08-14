import { evmToViemChainMap } from "@gardenfi/core";
import {
  Asset,
  isBitcoin,
  isEVM,
  isEvmNativeToken,
  isStarknet,
  isSui,
} from "@gardenfi/orderbook";
import { Network, with0x } from "@gardenfi/utils";
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
import { Connection, PublicKey } from "@solana/web3.js";
import logger from "./logger";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

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

export const getSolanaTokenBalance = async (
  address: PublicKey,
  asset: Asset
): Promise<number> => {
  try {
    const endpoint =
      network === Network.TESTNET
        ? "https://api.devnet.solana.com"
        : "https://solana-rpc.publicnode.com";

    const connection = new Connection(endpoint);

    const publicKey =
      typeof address === "string" ? new PublicKey(address) : address;

    if (asset.tokenAddress === "primary") {
      // Native SOL balance
      const balance = await connection.getBalance(publicKey);
      return formatAmount(balance, asset.decimals, 8);
    }

    let tokenMint: PublicKey;
    try {
      tokenMint = new PublicKey(asset.tokenAddress);
    } catch (err) {
      logger.error("Invalid token mint address", {
        address: asset.tokenAddress,
        error: err,
      });
      return 0;
    }

    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      mint: tokenMint,
    });

    if (tokenAccounts.value.length === 0) return 0;
    const balance = await connection.getTokenAccountBalance(
      tokenAccounts.value[0].pubkey
    );
    return formatAmount(balance.value.amount, balance.value.decimals, 8);
  } catch (error) {
    logger.error("Error fetching Solana token balance:", error);
    return 0;
  }
};

export const getStarknetTokenBalance = async (
  address: string,
  asset: Asset
) => {
  if (!isStarknet(asset.chain)) return 0;

  try {
    const provider = new RpcProvider({
      nodeUrl: STARKNET_CONFIG[network as keyof typeof STARKNET_CONFIG].nodeUrl,
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
    logger.error("Error fetching Starknet balance:", error);
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
    logger.error("Error fetching token balance:", e);
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
  } catch (error) {
    logger.error("Error fetching native balance:", error);
    return 0;
  }
};

export const getSuiTokenBalance = async (
  address: string,
  asset: Asset
): Promise<number> => {
  if (!isSui(asset.chain)) return 0;

  const suiRpcUrl = getFullnodeUrl(network);

  async function suiRpcCall(method: string, params: any[]) {
    const res = await fetch(suiRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  }

  try {
    if (
      asset.tokenAddress === "primary" ||
      asset.tokenAddress === "0x2::sui::SUI"
    ) {
      const BUFFER_FEE_IN_MIST = 5_000_000;
      const result = await suiRpcCall("suix_getBalance", [
        address,
        "0x2::sui::SUI",
      ]);

      const totalBalance = result.totalBalance;

      const client = new SuiClient({ url: getFullnodeUrl(network) });

      const tx = new Transaction();
      tx.setSender(address);

      const [coin] = tx.splitCoins(tx.gas, [totalBalance]);

      tx.transferObjects([coin], address);
      const data = await tx.build({ client });
      const dryRunResult = await client.dryRunTransactionBlock({
        transactionBlock: data,
      });
      const gasObject = dryRunResult.effects.gasUsed;

      const totalGasCost =
        Number(gasObject.computationCost) +
        Number(gasObject.storageCost) +
        Number(gasObject.nonRefundableStorageFee);

      return formatAmount(
        Math.max(totalBalance - (BUFFER_FEE_IN_MIST + totalGasCost), 0),
        asset.decimals,
        8
      );
    } else {
      const result = await suiRpcCall("suix_getAllBalances", [address]);

      const token = Array.isArray(result)
        ? result.find(
            (b: any) =>
              b.coinType === asset.tokenAddress ||
              b.coinType === asset.tokenAddress.replace(/^0x/, "0x")
          )
        : undefined;
      if (!token) return 0;
      return formatAmount(token.totalBalance, asset.decimals, 8);
    }
  } catch (error) {
    console.error("Error fetching Sui token balance:", error);
    return 0;
  }
};
