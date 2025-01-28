import { FC, useState } from "react";
import {
  DURATION,
  DURATION_MAP,
  ETH_BLOCKS_PER_DAY,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../constants";
import { Button } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { erc20Abi, Hex, maxUint256 } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../../layout/wagmi/config";
import { stakeABI } from "../abi/stake";
import { MIN_STAKE_AMOUNT } from "../../../constants/stake";
import { Toast } from "../../toast/Toast";
import { flowerABI } from "../abi/flower";

type StakeSubmissionCardProps = {
  selectedDuration: DURATION;
  amount: number;
  onClose: () => void;
};

export const StakeSubmissionCard: FC<StakeSubmissionCardProps> = ({
  selectedDuration,
  amount,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const shouldMintNFT = amount === 21000;

  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  //fetch allowance
  const { refetch } = useReadContract({
    abi: erc20Abi,
    functionName: "allowance",
    address: STAKING_CONFIG[STAKING_CHAIN].SEED_ADDRESS as Hex,
    args: [
      address as Hex,
      shouldMintNFT
        ? (STAKING_CONFIG[STAKING_CHAIN].FLOWER_CONTRACT_ADDRESS as Hex)
        : (STAKING_CONFIG[STAKING_CHAIN].STAKING_CONTRACT_ADDRESS as Hex),
    ],
    query: {
      enabled: false,
    },
    chainId: STAKING_CHAIN,
  });
  const { writeContractAsync } = useWriteContract();

  const handleStake = async () => {
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
      console.log("Stake tx hash : ", hash);
      Toast.success(`Staked ${amount} SEED for ${selectedDuration} months`);
      onClose();
    } catch (e) {
      console.error("error :", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={loading ? "disabled" : "primary"}
      size="lg"
      onClick={handleStake}
      loading={loading}
    >
      Stake
    </Button>
  );
};
