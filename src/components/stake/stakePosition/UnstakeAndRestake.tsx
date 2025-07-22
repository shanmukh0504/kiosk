import { Button } from "@gardenfi/garden-book";
import { FC, useState } from "react";
import { useWriteContract } from "wagmi";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useSwitchChain } from "wagmi";
import { simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { STAKING_CHAIN, STAKING_CONFIG } from "../constants";
import { Address, Hex } from "viem";
import { StakePositionStatus } from "../../../store/stakeStore";
import { stakeABI } from "../abi/stake";
import { config } from "../../../layout/wagmi/config";
import { StakingPosition } from "../../../store/stakeStore";
import { Toast } from "../../toast/Toast";
import { modalNames, modalStore } from "../../../store/modalStore";
import { scrollToTop } from "../../../utils/utils";

type UnstakeAndRestakeProps = {
  stakePos: StakingPosition;
};

export const UnstakeAndRestake: FC<UnstakeAndRestakeProps> = ({ stakePos }) => {
  const [isUnstaking, setIsUnstaking] = useState(false);

  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { setOpenModal } = modalStore();

  const isUnstakeable = stakePos.status === StakePositionStatus.expired;

  const handleUnstake = async () => {
    if (!isUnstakeable || !chainId || !address) return;
    try {
      setIsUnstaking(true);
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];

      const { request } = await simulateContract(config, {
        abi: stakeABI,
        address: stakingConfig.STAKING_CONTRACT_ADDRESS as Hex,
        functionName: "refund",
        args: [stakePos.id as Hex],
        account: address as Address,
        chainId: STAKING_CHAIN,
      });

      const tx = await writeContractAsync(request);
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      Toast.success("Unstaked successfully");
      scrollToTop();
    } catch (error) {
      console.error("Error during unstake:", error);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleRestake = () => {
    setOpenModal(modalNames.manageStake, {
      restake: {
        isRestake: true,
        stakingPosition: stakePos,
      },
    });
  };

  return (
    <div className="flex w-full gap-2 sm:w-min">
      <Button
        variant={isUnstaking ? "disabled" : "secondary"}
        size="sm"
        disabled={isUnstaking}
        onClick={handleUnstake}
        loading={isUnstaking}
        className="w-full"
      >
        Unstake
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleRestake}
        className="w-full"
      >
        Restake
      </Button>
    </div>
  );
};
