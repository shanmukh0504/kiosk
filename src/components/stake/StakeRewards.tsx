import { Button, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { distributerABI } from "./abi/distributerClaim";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { useState, useMemo, useRef } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Hex } from "viem";
import { formatAmount } from "../../utils/utils";
import { REWARD_CHAIN, STAKE_REWARD } from "./constants";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../layout/wagmi/config";
import { Toast } from "../toast/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipWrapper } from "./shared/ToolTipWrapper";
import { OverviewStats } from "./shared/OverviewStats";
import { EarningsToolTip } from "./shared/EarningsToolTip";
import { getDaysUntilNextEpoch } from "../../utils/utils";

export const StakeRewards = () => {
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);

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
      Toast.success("Withdrawal completed successfully");
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setIsClaimLoading(false);
    }
  };

  const earningsData = useMemo(() => {
    if (!epochData) return [];
    return epochData.slice(-8).map((epoch, index) => {
      const epochNumber = epochData.length - (8 - index - 1);
      return {
        epoch: epochNumber,
        earnings: Number(epoch.total_rewards_usd),
      };
    });
  }, [epochData]);

  const earningRate = useMemo(() => {
    if (!epochData || epochData.length < 2) return 0;

    const latestEpoch = Number(
      epochData[epochData.length - 1].total_rewards_usd
    );
    const previousEpoch = Number(
      epochData[epochData.length - 2].total_rewards_usd
    );

    if (previousEpoch === 0) return 0;

    return ((latestEpoch - previousEpoch) / previousEpoch) * 100;
  }, [epochData]);

  const earnings = useMemo(() => {
    if (
      !stakeRewards ||
      !stakeRewards.rewardResponse ||
      !stakeRewards.rewardResponse.epochs
    )
      return 0;
    const epochs = stakeRewards.rewardResponse.epochs;
    if (!epochs.length) return 0;
    return Number(epochs[epochs.length - 1].rewards_value_usd);
  }, [stakeRewards]);

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
      <div className="mx-auto flex w-[328px] flex-col gap-[20px] rounded-[15px] bg-white p-6 sm:w-[424px] md:w-[740px]">
        <Typography size="h5" weight="bold">
          Rewards
        </Typography>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-[32.67px] sm:w-[384px] sm:flex-row md:w-[600px] md:gap-[20px]">
            <div className="flex gap-4 sm:gap-8 md:gap-5">
              {epochData && (
                <OverviewStats
                  title={"Current Epoch"}
                  value={epochData?.length ?? 0}
                  size="sm"
                  className="w-[120px] sm:w-fit md:w-[90px]"
                />
              )}
              <AnimatePresence>
                <OverviewStats
                  title={"Earnings"}
                  info
                  showStat
                  value={formatAmount(earningRate ?? 0, 0, 2)}
                  size="sm"
                  toolTip={
                    <TooltipWrapper targetRef={statRef}>
                      <EarningsToolTip
                        earnings={earnings}
                        earningRate={earningRate}
                        earningsData={earningsData?.slice(0, 8) ?? []}
                      />
                    </TooltipWrapper>
                  }
                  className="w-[120px] sm:w-fit md:w-[90px]"
                  targetRef={statRef}
                />
              </AnimatePresence>
              <OverviewStats
                title={"Next epoch in"}
                value={`${daysUntilNextEpoch} days`}
                size="sm"
                className="w-[90px] sm:w-fit md:w-[80px] xl:w-[90px]"
              />
              <OverviewStats
                title={"Claim rewards"}
                value={`${availableReward || 0} cbBTC`}
                size="sm"
                isPink
                className="w-[90px] sm:w-fit md:w-[80px] xl:w-[90px]"
              />
            </div>
          </div>
          <Button
            variant={
              isClaimLoading || availableReward === 0 ? "disabled" : "primary"
            }
            size="sm"
            className={`w-full md:w-[120px] ${
              isClaimLoading || !availableReward
                ? "flex items-center justify-center self-center transition-colors duration-500"
                : ""
            }`}
            onClick={handleRewardClick}
            disabled={isClaimLoading || !availableReward}
            loading={isClaimLoading}
          >
            {isClaimLoading ? "Claiming..." : "Claim"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
