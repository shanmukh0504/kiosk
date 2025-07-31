import { PublicClient } from 'viem';
import { htlcabi } from '../common/abi/htlcabi';
import { Address } from 'viem';

export const estimateNativeTokenFee = async (
  publicClient: PublicClient,
  address: Address,
  amount: string,
  contractAddress: Address
): Promise<bigint | null> => {
  try {
    const safeValue = BigInt(amount) * 99n / 100n || 0;
    const redeemer = '0x000000000000000000000000000000000000dead';
    const timelock = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const secretHash = '0x' + '0'.repeat(64);

    const estimatedGas = await publicClient.estimateContractGas({
      address: contractAddress,
      abi: htlcabi,
      functionName: 'initiate',
      args: [redeemer, timelock, safeValue, secretHash],
      account: address,
      value: safeValue as bigint,
    });

    const gasPrice = await publicClient.getGasPrice();
    const fee = estimatedGas * gasPrice;

    return fee;
  } catch (err) {
    console.error('Gas fee estimation failed:', err);
    return null;
  }
};
