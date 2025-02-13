import { Button } from "@gardenfi/garden-book";
import {
  DURATION,
  DURATION_MAP,
  ETH_BLOCKS_PER_DAY,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../constants";
import { FC, useState } from "react";
import {
  StakePositionStatus,
  StakingPosition,
} from "../../../store/stakeStore";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useSwitchChain, useWriteContract } from "wagmi";
import { Hex, maxUint256 } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../../layout/wagmi/config";
import { Toast } from "../../toast/Toast";
import { stakeABI } from "../abi/stake";

type ExtendStakeProps = {
  selectedDuration: DURATION;
  stakePos: StakingPosition;
  onClose: () => void;
};

export const ExtendStake: FC<ExtendStakeProps> = ({
  selectedDuration,
  stakePos,
  onClose,
}) => {
  const [isExtending, setIsExtending] = useState(false);

  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const isExtendable = stakePos.status === StakePositionStatus.staked;

  const handleExtend = async () => {
    if (!isExtendable || !chainId || !address) return;

    try {
      setIsExtending(true);
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
        functionName: "extend",
        args: [stakePos.id as Hex, lockDuration],
      });
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      onClose();
      Toast.success("Stake extended successfully");
    } catch (error) {
      console.error("Error during extend:", error);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <Button
      variant={isExtending ? "disabled" : isExtendable ? "primary" : "disabled"}
      size="lg"
      disabled={!isExtendable}
      onClick={handleExtend}
      loading={isExtending}
    >
      Extend
    </Button>
  );
};
