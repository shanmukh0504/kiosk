import {
  Button,
  NFTIcon,
  RowInfoIcon,
  Typography,
} from "@gardenfi/garden-book";
import { FC, useRef, useState, useEffect, useMemo } from "react";
import {
  StakePositionStatus,
  stakeStore,
  StakingPosition,
} from "../../../store/stakeStore";
import { formatAmount, scrollToTop } from "../../../utils/utils";
import {
  ETH_BLOCKS_PER_DAY,
  SEED_DECIMALS,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../constants";
import { TooltipWrapper } from "../shared/ToolTipWrapper";
import { UnitRewardTooltip } from "../shared/UnitRewardTooltip";
import { motion } from "framer-motion";
import { modalNames, modalStore } from "../../../store/modalStore";
import { menuStore } from "../../../store/menuStore";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useSwitchChain, useWriteContract } from "wagmi";
import { Address, Hex } from "viem";
import { stakeABI } from "../abi/stake";
import { Toast } from "../../toast/Toast";
import { simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../../layout/wagmi/config";
import { viewPortStore } from "../../../store/viewPortStore";
import { isTestnet } from "../../../constants/constants";
import { assetInfoStore } from "../../../store/assetInfoStore";

type props = {
  index: number;
  stakePos: StakingPosition;
};

export const StakeDetails: FC<props> = ({ index, stakePos }) => {
  const { stakeRewards, stakeApys } = stakeStore();
  const { setOpenModal } = modalStore();
  const { openMenuId, setOpenMenu, closeMenu } = menuStore();
  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { isMobile, isSmallTab } = viewPortStore();
  const { allAssets } = assetInfoStore();

  const [hovered, setHovered] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPermaStake = stakePos.isPerma;
  const menuId = `stake-menu-${stakePos.id}`;
  const isMenuOpen = openMenuId === menuId;
  const hasExpired = stakePos.status === StakePositionStatus.expired;
  const isUnstakeable = stakePos.status === StakePositionStatus.expired;

  const cbbtcReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedCBBTCRewardsUSD ||
      0,
    8,
    8
  );

  const cbbtcAsset = useMemo(() => {
    if (!allAssets) return null;
    const targetChain = isTestnet ? "base_sepolia" : "base";

    let asset = Object.values(allAssets).find(
      (asset) => asset.chain === targetChain && asset.symbol === "cbBTC"
    );

    if (!asset) {
      asset = Object.values(allAssets).find(
        (asset) => asset.symbol === "cbBTC"
      );
    }

    return asset;
  }, [allAssets]);

  const seedAsset = useMemo(() => {
    if (!allAssets) return null;
    const targetChain = isTestnet ? "arbitrum_sepolia" : "arbitrum";

    let asset = Object.values(allAssets).find(
      (asset) => asset.chain === targetChain && asset.symbol === "seed"
    );

    return asset;
  }, [allAssets]);

  const cbbtcPrice = useMemo(() => {
    if (!cbbtcAsset) return 0;
    return cbbtcAsset.price ?? 0;
  }, [cbbtcAsset]);

  const seedPrice = useMemo(() => {
    if (!seedAsset) return 0;
    return seedAsset.price ?? 0;
  }, [seedAsset]);

  const seedReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedSeedRewardsUSD ??
      0,
    SEED_DECIMALS,
    5
  );

  const cbbtcRewardsInUSDC = cbbtcReward * cbbtcPrice;
  const seedRewardsInUSDC = seedReward * seedPrice;

  const stakeAmount = formatAmount(stakePos.amount, SEED_DECIMALS, 0);
  const formattedAmount = stakeAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const daysPassedSinceStake = Math.floor(
    (new Date().getTime() - new Date(stakePos.stakedAt).getTime()) /
      (1000 * 3600 * 24)
  );
  const expiryInDays = Math.floor(
    (stakePos.expiry - stakePos.lastStakedAtBlock) / ETH_BLOCKS_PER_DAY
  );
  const stakeEndDate = new Date();
  stakeEndDate.setDate(
    stakeEndDate.getDate() + (expiryInDays - daysPassedSinceStake)
  );
  const stakeEndDateString = isPermaStake
    ? ""
    : stakeEndDate.toISOString().split("T")[0].replaceAll("-", "/");

  // Get APY for this stake position
  const stakeApy = stakeApys[stakePos.id] ?? 0;
  const formattedApy = stakeApy > 0 ? `${stakeApy.toFixed(2)}%` : "0%";

  const handleRestake = () => {
    setOpenModal(modalNames.manageStake, {
      restake: {
        isRestake: true,
        stakingPosition: stakePos,
      },
    });
  };

  const handleUnstake = async () => {
    if (!isUnstakeable || !chainId || !address) return;
    try {
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
    }
  };

  const handleExtend = () => {
    setOpenModal(modalNames.manageStake, {
      extend: {
        isExtend: true,
        stakingPosition: stakePos,
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (hovered && targetRef.current && !targetRef.current.contains(target)) {
        setHovered(false);
      }
      // Don't close the menu if clicking inside the tooltip content
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        // Check if the click is on a button inside the tooltip
        const isButtonClick = (target as Element)?.closest("button");
        if (!isButtonClick) {
          closeMenu();
        }
      }
    };
    if (hovered || isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hovered, isMenuOpen, closeMenu]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <motion.tr
      initial={{ opacity: 0, y: -30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2,
          delay: 0.065 * index,
          opacity: { delay: 0.065 * index },
          type: "spring",
          stiffness: 200,
          damping: 25,
        },
      }}
      exit={{
        opacity: 0,
        y: -10,
        transition: { duration: 0.1 },
      }}
      className={`origin-top ${index % 2 !== 0 && "bg-white/50"}`}
    >
      <td className="w-[90px] py-2 pl-6 text-left">
        <Typography
          size="h4"
          weight="regular"
          className="flex items-center gap-1"
        >
          {formattedAmount}
          {stakePos.isGardenerPass && <NFTIcon className="h-4" />}
        </Typography>
      </td>

      <td className="w-[156px] py-2 pl-5 text-left sm:pl-[66px]">
        <span
          ref={targetRef}
          className="inline-block cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {hovered && (!!seedReward || !!cbbtcReward) && (
            <TooltipWrapper
              offsetX={isMobile || isSmallTab ? 5 : 10}
              offsetY={isMobile || isSmallTab ? 20 : 9}
              targetRef={targetRef}
            >
              <UnitRewardTooltip seed={seedReward} cbBtc={cbbtcReward} />
            </TooltipWrapper>
          )}
          <Typography size="h4" weight="regular">
            ${(seedRewardsInUSDC + cbbtcRewardsInUSDC).toFixed(4)}
          </Typography>
        </span>
      </td>
      <td className="w-[130px] py-2 pl-5 text-left sm:pl-[66px]">
        <Typography size="h4" weight="regular">
          {stakePos.votes}
        </Typography>
      </td>
      <td className="w-[130px] py-2 pl-5 text-left sm:pl-[66px]">
        <Typography size="h4" weight="regular">
          {formattedApy}
        </Typography>
      </td>
      <td className="flex w-[140px] items-center pl-5 pt-3 text-left sm:w-[186px] sm:pl-[66px] sm:pt-0">
        <div
          className={`mb-2.5 flex max-h-7 w-full items-center gap-3 overflow-hidden sm:mb-0 sm:mt-1.5 ${hasExpired ? "justify-center" : "justify-start"}`}
        >
          {hasExpired ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRestake}
              className="!h-7 w-fit !min-w-20 !rounded-lg border border-green-500"
            >
              Restake
            </Button>
          ) : (
            <Typography size="h4" weight="regular">
              {stakeEndDateString}
            </Typography>
          )}
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
            }
            if (isMenuOpen) {
              closeMenu();
            } else {
              setOpenMenu(menuId);
            }
            clickTimeoutRef.current = setTimeout(() => {
              clickTimeoutRef.current = null;
            }, 150);
          }}
          className={`mx-1 -mt-1 flex w-8 cursor-pointer items-center sm:mb-0 sm:mt-2.5 ${isPermaStake && "pointer-events-none opacity-0"}`}
        >
          <div className="relative">
            <span ref={menuRef} className="inline-block cursor-pointer">
              <RowInfoIcon className="h-4 w-4 p-[1px]" />
            </span>
            {isMenuOpen && (
              <TooltipWrapper
                targetRef={menuRef}
                offsetX={isMobile || isSmallTab ? 3.6 : -76}
                offsetY={isMobile || isSmallTab ? 16 : -20}
              >
                <div className="flex flex-col gap-2">
                  {hasExpired && !isPermaStake ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnstake();
                        closeMenu();
                      }}
                      className="z-[9999] !min-w-20 !bg-white !px-0 !text-dark-grey"
                    >
                      Unstake
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtend();
                        closeMenu();
                      }}
                      className="!min-w-20 !bg-white !px-0 !text-dark-grey"
                    >
                      Extend
                    </Button>
                  )}
                </div>
              </TooltipWrapper>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
};
