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
      console.error("Invalid token mint address:", asset.tokenAddress, err);
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
    console.error("Error fetching Solana token balance:", error);
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

export const getSuiTokenBalance = async (
  address: string,
  asset: Asset
): Promise<number> => {
  /**
   * To get the Sui token balance for a given address and token:
   * - If the token is the native SUI coin, use the Sui JSON-RPC to fetch the coin balance for the address.
   * - If the token is an SUI token (SUI Move coin), use the Sui JSON-RPC to fetch all coin objects of the given type for the address,
   *   sum their balances, and return the total, formatted to the asset's decimals.
   *
   * We'll use the Sui JSON-RPC endpoint and fetch the balances using the Sui RPC API.
   */
  if (!isSui(asset.chain)) return 0;

  // Use the public Sui RPC endpoint (mainnet or testnet)
  const suiRpcUrl =
    network === Network.TESTNET
      ? "https://fullnode.testnet.sui.io:443"
      : "https://fullnode.mainnet.sui.io:443";

  // Helper to call Sui JSON-RPC
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
    // Native SUI coin
    if (
      asset.tokenAddress === "primary" ||
      asset.tokenAddress === "0x2::sui::SUI"
    ) {
      // SUI native coin
      // Use `suix_getBalance` or `sui_getBalance` (depending on endpoint)
      // We'll use `suix_getBalance` which is supported on public endpoints
      const result = await suiRpcCall("suix_getBalance", [address]);
      // result.totalBalance is a string (in base units)
      return formatAmount(result.totalBalance, asset.decimals, 8);
    } else {
      // SUI token (Move coin)
      // Use suix_getAllBalances to get all coin types and filter for the token
      const result = await suiRpcCall("suix_getAllBalances", [address]);
      // result is an array of { coinType, totalBalance, ... }
      const token = result.find(
        (b: any) =>
          b.coinType === asset.tokenAddress ||
          b.coinType === asset.tokenAddress.replace(/^0x/, "0x")
      );
      if (!token) return 0;
      return formatAmount(token.totalBalance, asset.decimals, 8);
    }
  } catch (error) {
    console.error("Error fetching Sui token balance:", error);
    return 0;
  }
};
