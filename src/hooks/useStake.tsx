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
import { erc20Abi, Hex, maxUint256 } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../layout/wagmi/config";
import { flowerABI } from "../components/stake/abi/flower";
import { logger } from "@sentry/react";
import { Toast } from "../components/toast/Toast";
import { stakeABI } from "../components/stake/abi/stake";
import { stakeStore, StakeType } from "../store/stakeStore";
import { modalNames, modalStore } from "../store/modalStore";

export const useStake = () => {
  const [loading, setLoading] = useState(false);

  const { stakeType, setAmount } = stakeStore();
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

  const handleStake = async (
    amount: number,
    shouldMintNFT: boolean,
    selectedDuration: DURATION
  ) => {
    if (!chainId || !address) return;
    const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];
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
        const res = await writeContractAsync({
          abi: erc20Abi,
          functionName: "approve",
          address: stakingConfig.SEED_ADDRESS as Hex,
          args: [
            shouldMintNFT
              ? (stakingConfig.FLOWER_CONTRACT_ADDRESS as Hex)
              : (stakingConfig.STAKING_CONTRACT_ADDRESS as Hex),
            maxUint256,
          ],
        });
        await waitForTransactionReceipt(config, {
          hash: res,
        });
      }
      //approve successful, go ahead with stake

      let hash;
      if (shouldMintNFT) {
        const mintRes = await writeContractAsync({
          abi: flowerABI,
          functionName: "mint",
          address: stakingConfig.FLOWER_CONTRACT_ADDRESS as Hex,
          args: [stakingConfig.GARDEN_FILLER_ADDRESS as Hex],
        });

        hash = mintRes;
      } else {
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
          args: [
            stakingConfig.GARDEN_FILLER_ADDRESS as Hex,
            units,
            lockDuration,
          ],
        });
        hash = stakeRes;
      }
      await waitForTransactionReceipt(config, {
        hash,
      });
      //✅ stake success
      logger.info("Stake tx hash : ", { hash });
      Toast.success(
        `Staked ${amount} SEED for ${selectedDuration} months successfully`
      );
      setAmount(0);
      setCloseModal(modalNames.manageStake);
    } catch (e) {
      logger.error("error :", { e });
    } finally {
      setLoading(false);
    }
  };

  return { handleStake, loading };
};
