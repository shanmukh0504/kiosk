import { Button } from "@gardenfi/garden-book";
import { Typography } from "@gardenfi/garden-book";
import DurationMenu from "../shared/DurationMenu";
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

type ExtendOrUnstakeProps = {
  selectedDuration: DURATION;
  setSelectedDuration: (duration: DURATION) => void;
  stakePos: StakingPosition;
  onClose: () => void;
};

export const ExtendOrUnstake: FC<ExtendOrUnstakeProps> = ({
  selectedDuration,
  setSelectedDuration,
  stakePos,
  onClose,
}) => {
  const [isExtending, setIsExtending] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const isExtendable = stakePos.status === StakePositionStatus.staked;
  const isUnstakeable = stakePos.status === StakePositionStatus.unStaked;

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

  const handleUnstake = async () => {
    if (!isUnstakeable || !chainId || !address) return;
    try {
      setIsUnstaking(true);
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];

      const tx = await writeContractAsync({
        address: stakingConfig.STAKING_CONTRACT_ADDRESS as Hex,
        abi: stakeABI,
        functionName: "refund",
        args: [stakePos.id as Hex],
      });
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      onClose();
      Toast.success("UnStake successful");
    } catch (error) {
      console.error("Error during unstake:", error);
    } finally {
      setIsUnstaking(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 bg-white bg-opacity-25 rounded-2xl">
      <Typography size="h5" weight="bold">
        Manage Stake
      </Typography>
      <DurationMenu
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
      />
      <div className="flex justify-between items-center gap-2">
        <Button
          variant={
            isExtending ? "disabled" : isExtendable ? "primary" : "disabled"
          }
          size="lg"
          className="w-full"
          disabled={!isExtendable}
          onClick={handleExtend}
          loading={isExtending}
        >
          Extend
        </Button>
        <Button
          variant={
            isUnstaking ? "disabled" : isUnstakeable ? "primary" : "disabled"
          }
          size="lg"
          className="w-full"
          disabled={!isUnstakeable}
          onClick={handleUnstake}
          loading={isUnstaking}
        >
          Unstake
        </Button>
      </div>
    </div>
  );
};
