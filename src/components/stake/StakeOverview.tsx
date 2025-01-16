import { Button, Typography } from "@gardenfi/garden-book";
import { stakeStore, StakingReward } from "../../store/stakeStore";
import { TEN_THOUSAND } from "../../constants/stake";
import { distributerABI } from "./abi/distributerClaim";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { useEffect, useState, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Hex } from "viem";
import { StakeStats } from "./shared/StakeStats";
import axios from "axios";
import { API } from "../../constants/api";
import { formatAmount } from "../../utils/utils";
import { STAKING_CHAIN } from "./constants";
import { STAKING_CONFIG } from "./constants";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../layout/wagmi/config";
import { Toast } from "../toast/Toast";
// import { STAKING_CHAIN } from "./constants";

export const StakeOverview = () => {
  const [isRewardLoading, setIsRewardLoading] = useState(false);
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [rewardResponse, setRewardResponse] = useState<StakingReward>();

  const { totalStakedAmount, totalVotes } = stakeStore();
  const { writeContractAsync } = useWriteContract();
  const { address, chainId } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  // get claimed amount
  const { data: claimedAmount, refetch: refetchClaimedAmount } =
    useReadContract({
      abi: distributerABI,
      functionName: "getClaimedAmount",
      address: STAKING_CONFIG[STAKING_CHAIN].DISTRIBUTER_CONTRACT as Hex,
      args: [address as Hex],
      chainId: STAKING_CHAIN,
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
    return rewardResponse
      ? formatAmount(
          rewardResponse.cumulative_rewards_wbtc - Number(claimedAmount ?? 0),
          8,
          5
        )
      : 0;
  }, [rewardResponse, claimedAmount]);

  const handleRewardClick = async () => {
    if (!chainId || !address || !rewardResponse) return;
    const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];
    if (!stakingConfig) return;

    try {
      setIsClaimLoading(true);
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
      }

      //small workaround to make sure the chain is switched other wise the claim is failing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const tx = await writeContractAsync({
        abi: distributerABI,
        functionName: "claim",
        address: stakingConfig.DISTRIBUTER_CONTRACT as Hex,
        args: [
          address as Hex,
          BigInt(rewardResponse.cumulative_rewards_wbtc),
          BigInt(rewardResponse.nonce),
          ("0x" + rewardResponse.claim_signature) as Hex,
        ],
        chainId: STAKING_CHAIN,
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

  useEffect(() => {
    if (!address) return;

    const fetchStakeReward = async () => {
      try {
        const resp = await axios.get<StakingReward>(API().reward(address));
        if (resp.status === 200 && resp.data) {
          setRewardResponse(resp.data);
        }
        return;
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };

    setIsRewardLoading(true);
    fetchStakeReward().finally(() => setIsRewardLoading(false));
    const intervalId = setInterval(fetchStakeReward, 10000);
    return () => clearInterval(intervalId);
  }, [address]);

  return (
    <div className="w-[328px] sm:w-[424px] md:w-[740px] rounded-[15px] bg-opacity-50 gap-4 bg-white mx-auto p-6 flex flex-col">
      <Typography size="h5" weight="bold">
        Staking Overview
      </Typography>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center ">
        <div className="flex gap-10 justify-between w-full md:w-[328px]">
          <StakeStats title={"Staked Seed"} value={formattedAmount} size="sm" />
          <StakeStats
            title={"Votes"}
            value={
              isRewardLoading
                ? "Loading..."
                : totalVotes !== undefined
                ? totalVotes
                : 0
            }
            size="sm"
          />
          <StakeStats
            title={"Staking rewards"}
            value={isRewardLoading ? "Loading..." : `${availableReward} WBTC`}
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
          disabled={isClaimLoading || isRewardLoading || availableReward === 0}
          loading={isClaimLoading}
        >
          {isClaimLoading ? "Claiming..." : "Withdraw"}
        </Button>
      </div>
    </div>
  );
};
