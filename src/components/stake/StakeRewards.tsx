import { Button, KeyboardDownIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { distributerABI } from "./abi/distributerClaim";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { useState, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Address, Hex } from "viem";
import { formatAmount, getDaysUntilNextEpoch } from "../../utils/utils";
import { REWARD_CHAIN, STAKE_REWARD } from "./constants";
import { simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../layout/wagmi/config";
import { Toast } from "../toast/Toast";
import { motion } from "framer-motion";
import { RewardStats } from "./shared/RewardStats";

type StakeRewardsProps = {
  showDetails: boolean;
  setShowDetails: (showDetails: boolean) => void;
};

export const StakeRewards = ({
  showDetails,
  setShowDetails,
}: StakeRewardsProps) => {
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  // const statRef = useRef<HTMLDivElement>(null);

  const { epochData, stakeRewards } = stakeStore();
  const { writeContractAsync } = useWriteContract();
  const { address, chainId } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  // get claimed amount
  const { data: claimedAmount, refetch: refetchClaimedAmount } =
    useReadContract({
      abi: distributerABI,
      functionName: "getClaimedAmount",
      address: STAKE_REWARD.CBBTC.DISTRIBUTER_CONTRACT as Hex,
      args: [address as Hex],
      chainId: REWARD_CHAIN,
      query: {
        enabled: !!address,
        refetchInterval: 15_000,
      },
    });

  const availableReward = useMemo(() => {
    return stakeRewards
      ? formatAmount(
          stakeRewards.totalcbBtcReward - Number(claimedAmount ?? 0),
          8,
          8
        )
      : 0;
  }, [stakeRewards, claimedAmount]);

  const daysUntilNextEpoch = useMemo(
    () => getDaysUntilNextEpoch(epochData),
    [epochData]
  );

  const handleRewardClick = async () => {
    if (!chainId || !address || !stakeRewards) return;
    const rewardConfig = STAKE_REWARD.CBBTC;
    if (!rewardConfig) return;

    try {
      setIsClaimLoading(true);
      if (chainId !== REWARD_CHAIN) {
        await switchChainAsync({ chainId: REWARD_CHAIN });
        //small workaround to make sure the chain is switched other wise the claim is failing
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const { request } = await simulateContract(config, {
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
        account: address as Address,
      });

      const tx = await writeContractAsync(request);
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      await refetchClaimedAmount();
      Toast.success("Withdrawal completed successfully");
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setIsClaimLoading(false);
    }
  };

  // const earningsData = useMemo(() => {
  //   if (!epochEarnings || !epochData) return [];
  //   const maxEpochs = 8;
  //   const latestCompletedEpoch = epochData.length - 1;
  //   // Build the list of epochs to show, then reverse it so latest is last
  //   const epochsToShow = Array.from(
  //     { length: maxEpochs },
  //     (_, i) => latestCompletedEpoch - maxEpochs + 1 + i
  //   ).reverse();

  //   // Map by index: earnings[0] → epochsToShow[0], etc.
  //   return epochsToShow.map((epochNumber, i) => ({
  //     epoch: epochNumber,
  //     earnings: epochEarnings[i]
  //       ? Number(epochEarnings[i].rewards_value_usd)
  //       : 0,
  //   }));
  // }, [epochEarnings, epochData]);

  // const earningRate = useMemo(() => {
  //   if (!earningsData || earningsData.length < 2) return 0;
  //   const latest = earningsData[0].earnings;
  //   const previous = earningsData[1].earnings;
  //   if (previous === 0) return latest === 0 ? 0 : 100;
  //   return ((latest - previous) / previous) * 100;
  // }, [earningsData]);

  return (
    <motion.div
      animate={{
        scale: ["80%", "100%"],
        margin: ["-10%", "0%"],
        opacity: ["0%", "100%"],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          once: true,
          opacity: {
            duration: 0.3,
            delay: 0.4,
          },
        },
      }}
      style={{ transformOrigin: "top" }}
    >
      <motion.div
        onClick={() => setShowDetails(!showDetails)}
        className={`ease- -in-out mx-auto flex w-[328px] cursor-pointer flex-col gap-4 rounded-2xl bg-white p-6 pb-5 transition-all duration-300 sm:w-[460px] md:w-[740px] ${showDetails && "rounded-b-none"}`}
      >
        <div className="flex items-center justify-between">
          <Typography size="h5" weight="medium">
            Rewards
          </Typography>
          <KeyboardDownIcon
            className={`${showDetails && "rotate-180"} cursor-pointer transition-all duration-200 ease-in-out`}
          />
        </div>
        <div className="flex flex-col items-end justify-between gap-4 md:flex-row md:items-center">
          <div className="grid w-full grid-cols-2 md:w-[210px] md:gap-10">
            <RewardStats
              title={"Next payout"}
              value={`${daysUntilNextEpoch} days`}
            />
            <RewardStats
              title={"Available to claim"}
              value={`${availableReward || 0} cbBTC`}
            />
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-fit md:flex-row">
            <Button
              variant={
                isClaimLoading || availableReward === 0 ? "disabled" : "primary"
              }
              size="sm"
              className={`!w-full lg:w-[120px] ${
                isClaimLoading || !availableReward
                  ? "flex items-center justify-center self-center transition-colors duration-500"
                  : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRewardClick();
              }}
              disabled={isClaimLoading || !availableReward}
              loading={isClaimLoading}
            >
              {isClaimLoading ? "Claiming..." : "Claim"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
