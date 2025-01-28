import { Button, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { TEN_THOUSAND } from "../../constants/stake";
import { distributerABI } from "./abi/distributerClaim";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { useState, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Hex } from "viem";
import { StakeStats } from "./shared/StakeStats";
import { formatAmount } from "../../utils/utils";
import { REWARD_CHAIN, REWARD_CONFIG } from "./constants";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../layout/wagmi/config";
import { Toast } from "../toast/Toast";

export const StakeOverview = () => {
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const { totalStakedAmount, totalVotes, stakeRewards } = stakeStore();
  const { writeContractAsync } = useWriteContract();
  const { address, chainId } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  // get claimed amount
  const { data: claimedAmount, refetch: refetchClaimedAmount } =
    useReadContract({
      abi: distributerABI,
      functionName: "getClaimedAmount",
      address: REWARD_CONFIG[REWARD_CHAIN].DISTRIBUTER_CONTRACT as Hex,
      args: [address as Hex],
      chainId: REWARD_CHAIN,
      query: {
        enabled: !!address,
        refetchInterval: 15_000,
      },
    });

  const formattedAmount =
    totalStakedAmount === undefined
      ? "0"
      : totalStakedAmount >= TEN_THOUSAND
      ? totalStakedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : totalStakedAmount.toString();

  const availableReward = useMemo(() => {
    return stakeRewards
      ? formatAmount(
          stakeRewards.rewardResponse.cumulative_rewards_cbbtc -
            Number(claimedAmount ?? 0),
          8,
          5
        )
      : 0;
  }, [stakeRewards, claimedAmount]);

  const handleRewardClick = async () => {
    if (!chainId || !address || !stakeRewards) return;
    const rewardConfig = REWARD_CONFIG[REWARD_CHAIN];
    if (!rewardConfig) return;

    try {
      setIsClaimLoading(true);
      if (chainId !== REWARD_CHAIN) {
        await switchChainAsync({ chainId: REWARD_CHAIN });
      }

      //small workaround to make sure the chain is switched other wise the claim is failing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const tx = await writeContractAsync({
        abi: distributerABI,
        functionName: "claim",
        address: rewardConfig.DISTRIBUTER_CONTRACT as Hex,
        args: [
          address as Hex,
          BigInt(stakeRewards.rewardResponse.cumulative_rewards_cbbtc),
          BigInt(stakeRewards.rewardResponse.nonce),
          ("0x" + stakeRewards.rewardResponse.latest_claim_signature) as Hex,
        ],
        chainId: REWARD_CHAIN,
      });
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      await refetchClaimedAmount();
      Toast.success("Withdrawal successful");
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setIsClaimLoading(false);
    }
  };

  return (
    <div className="w-[328px] sm:w-[424px] md:w-[740px] rounded-[15px] bg-opacity-50 gap-4 bg-white mx-auto p-6 flex flex-col">
      <Typography size="h5" weight="bold">
        Staking overview
      </Typography>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center ">
        <div className="flex gap-10 justify-between w-full md:w-[350px]">
          <StakeStats title={"Staked SEED"} value={formattedAmount} size="sm" />
          <StakeStats
            title={"Votes"}
            value={totalVotes !== undefined ? totalVotes : 0}
            size="sm"
          />
          <StakeStats
            title={"Staking rewards"}
            value={`${availableReward} cbBTC`}
            size="sm"
            isPink
          />
        </div>
        <Button
          variant={
            isClaimLoading || availableReward === 0 ? "disabled" : "primary"
          }
          size="sm"
          className={`w-full md:w-[120px] ${
            isClaimLoading || availableReward === 0
              ? "transition-colors duration-500 flex items-center justify-center self-center"
              : ""
          }`}
          onClick={handleRewardClick}
          disabled={isClaimLoading || availableReward === 0}
          loading={isClaimLoading}
        >
          {isClaimLoading ? "Claiming..." : "Claim"}
        </Button>
      </div>
    </div>
  );
};
