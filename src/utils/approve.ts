import { with0x } from "@gardenfi/utils";
import { erc20Abi, getContract, maxUint256, WalletClient } from "viem";
import { waitForTransactionReceipt } from "viem/actions";

export const checkAllowance = async (
    amount: number,
    tokenAddress: string,
    contractAddress: string,
    walletClient: WalletClient,
) => {
    if (!walletClient.account) return Error('No account found');

    const erc20Contract = getContract({
        address: with0x(tokenAddress),
        abi: erc20Abi,
        client: walletClient,
    });

    try {
        const allowance = await erc20Contract.read.allowance([
            with0x(walletClient.account.address),
            with0x(contractAddress),
        ]);

        if (BigInt(allowance) < BigInt(amount)) {
            return false;
        }
        return true;
    } catch (error) {
        return Error('Failed to check allowance: ' + error);
    }
}

export const approve = async (
    tokenAddress: string,
    contractAddress: string,
    walletClient: WalletClient,
) => {
    if (!walletClient.account) return Error('No account found');

    const erc20Contract = getContract({
        address: with0x(tokenAddress),
        abi: erc20Abi,
        client: walletClient,
    });

    try {
        const res = await erc20Contract.write.approve(
            [with0x(contractAddress), maxUint256],
            {
              account: walletClient.account,
              chain: walletClient.chain,
            },
          );

        const receipt = await waitForTransactionReceipt(walletClient, {
            hash: res,
        });

        if (receipt.status !== 'success') {
            return Error('Transaction failed');
        }
        return true;
    } catch (error) {
        return Error('Failed to approve: ' + error);
    }
};