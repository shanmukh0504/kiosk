import { useState } from "react";
import {
  DURATION,
  DURATION_MAP,
  ETH_BLOCKS_PER_DAY,
  MIN_STAKE_AMOUNT,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../components/stake/constants";
import { useEVMWallet } from "./useEVMWallet";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { Address, erc20Abi, Hex, maxUint256 } from "viem";
import { simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../layout/wagmi/config";
import { flowerABI } from "../components/stake/abi/flower";
import { logger } from "@sentry/react";
import { Toast } from "../components/toast/Toast";
import { stakeABI } from "../components/stake/abi/stake";
import { stakeStore, StakeType } from "../store/stakeStore";
import { modalNames, modalStore } from "../store/modalStore";

export const useStake = () => {
  const [loading, setLoading] = useState(false);

  const { stakeType } = stakeStore();
  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { setCloseModal } = modalStore();

  const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];

  const { refetch } = useReadContract({
    abi: erc20Abi,
    functionName: "allowance",
    address: stakingConfig.SEED_ADDRESS as Hex,
    args: [
      address as Hex,
      stakeType === StakeType.GARDEN_PASS
        ? (stakingConfig.FLOWER_CONTRACT_ADDRESS as Hex)
        : (stakingConfig.STAKING_CONTRACT_ADDRESS as Hex),
    ],
    query: {
      enabled: false,
    },
    chainId: STAKING_CHAIN,
  });

  const { writeContractAsync } = useWriteContract();

  const handleStake = async (amount: number, selectedDuration: DURATION) => {
    if (!chainId || !address) return;
    if (!stakingConfig) return;

    try {
      setLoading(true);
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
      }
      const allowance = await refetch();
      const _amount =
        BigInt(amount) * BigInt(10 ** stakingConfig.SEED_DECIMALS);
      const units = BigInt(amount) / BigInt(MIN_STAKE_AMOUNT);

      if (allowance.data === undefined) {
        setLoading(false);
        return;
      }
      if (allowance.data === 0n || allowance.data < _amount) {
        const { request } = await simulateContract(config, {
          abi: erc20Abi,
          functionName: "approve",
          address: stakingConfig.SEED_ADDRESS as Hex,
          args: [stakingConfig.STAKING_CONTRACT_ADDRESS as Hex, maxUint256],
          account: address as Address,
          chainId: STAKING_CHAIN,
        });

        const res = await writeContractAsync(request);
        await waitForTransactionReceipt(config, {
          hash: res,
        });
      }
      //approve successful, go ahead with stake

      let hash;
      const lockDuration =
        selectedDuration === "INFINITE"
          ? maxUint256
          : BigInt(
              DURATION_MAP[selectedDuration].lockDuration * ETH_BLOCKS_PER_DAY
            );

      const stakeRes = await writeContractAsync({
        abi: stakeABI,
        functionName: "vote",
        address: stakingConfig.STAKING_CONTRACT_ADDRESS as Hex,
        args: [stakingConfig.GARDEN_FILLER_ADDRESS as Hex, units, lockDuration],
      });
      hash = stakeRes;

      await waitForTransactionReceipt(config, {
        hash,
      });
      //✅ stake success
      logger.info("Stake tx hash : ", { hash });
      Toast.success(
        `Staked ${amount} SEED for ${selectedDuration} months successfully`
      );
      setCloseModal(modalNames.manageStake);
    } catch (e) {
      logger.error("error :", { e });
    } finally {
      setLoading(false);
    }
  };

  const handleNftStake = async (nftAmount: number) => {
    if (!chainId || !address) return;
    if (!stakingConfig) return;

    try {
      setLoading(true);
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
      }
      const allowance = await refetch();
      const _amount =
        BigInt(nftAmount) * BigInt(10 ** stakingConfig.SEED_DECIMALS);

      if (allowance.data === undefined) {
        setLoading(false);
        return;
      }
      if (allowance.data === 0n || allowance.data < _amount) {
        const { request } = await simulateContract(config, {
          abi: erc20Abi,
          functionName: "approve",
          address: stakingConfig.SEED_ADDRESS as Hex,
          args: [stakingConfig.FLOWER_CONTRACT_ADDRESS as Hex, maxUint256],
          account: address as Address,
          chainId: STAKING_CHAIN,
        });

        const res = await writeContractAsync(request);
        await waitForTransactionReceipt(config, {
          hash: res,
        });
      }
      //approve successful, go ahead with stake

      let hash;
      const mintRes = await writeContractAsync({
        abi: flowerABI,
        functionName: "mint",
        address: stakingConfig.FLOWER_CONTRACT_ADDRESS as Hex,
        args: [stakingConfig.GARDEN_FILLER_ADDRESS as Hex],
      });

      hash = mintRes;

      await waitForTransactionReceipt(config, {
        hash,
      });
      //✅ stake success
      logger.info("Stake tx hash : ", { hash });
      Toast.success(`Staked ${nftAmount} SEED for NFT successfully`);
    } catch (e) {
      logger.error("error :", { e });
    } finally {
      setLoading(false);
    }
  };

  return { handleStake, handleNftStake, loading };
};
