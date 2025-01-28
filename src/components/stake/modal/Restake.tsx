import { FC, useState } from "react";
import {
  StakePositionStatus,
  StakingPosition,
} from "../../../store/stakeStore";
import {
  DURATION,
  DURATION_MAP,
  ETH_BLOCKS_PER_DAY,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../constants";
import { useWriteContract } from "wagmi";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useSwitchChain } from "wagmi";
import { Hex } from "viem";
import { maxUint256 } from "viem";
import { stakeABI } from "../abi/stake";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../../layout/wagmi/config";
import { Toast } from "../../toast/Toast";
import { Button } from "@gardenfi/garden-book";

type RestakeProps = {
  selectedDuration: DURATION;
  stakePos: StakingPosition;
  onClose: () => void;
};

export const Restake: FC<RestakeProps> = ({
  selectedDuration,
  stakePos,
  onClose,
}) => {
  const [isRestaking, setIsRestaking] = useState(false);

  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const isRestakeable = stakePos.status === StakePositionStatus.expired;

  const handleRestake = async () => {
    if (!isRestakeable || !chainId || !address) return;

    try {
      setIsRestaking(true);
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];

      const lockDuration =
        selectedDuration === "INFINITE"
          ? maxUint256
          : BigInt(
              DURATION_MAP[selectedDuration].lockDuration * ETH_BLOCKS_PER_DAY
            );

      const tx = await writeContractAsync({
        address: stakingConfig.STAKING_CONTRACT_ADDRESS as Hex,
        abi: stakeABI,
        functionName: "renew",
        args: [stakePos.id as Hex, lockDuration],
      });

      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      onClose();
      Toast.success("Stake renewed successfully");
    } catch (error) {
      console.error("Error during extend:", error);
    } finally {
      setIsRestaking(false);
    }
  };

  return (
    <Button
      variant={
        isRestaking ? "disabled" : isRestakeable ? "primary" : "disabled"
      }
      size="lg"
      disabled={!isRestakeable}
      onClick={handleRestake}
      loading={isRestaking}
    >
      Restake
    </Button>
  );
};
