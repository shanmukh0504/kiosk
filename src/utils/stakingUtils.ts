import { getWalletClient } from "wagmi/actions";
import { config } from "../layout/wagmi/config";
import {
  DURATION,
  DURATION_MAP,
  ETH_BLOCKS_PER_DAY,
  INFINITE,
  MIN_DELEGATE_STAKE,
  SEED_FOR_MINTING_NFT,
  STAKING_CONFIG,
} from "../constants/stake";
import { checkAllowanceAndApprove } from "@gardenfi/utils";
import { MaxUint256 } from "@ethersproject/constants";

export const checkAllowanceApproveSeed = async (
  inputAmount: string,
  selectedDuration: DURATION
) => {
  const client = await getWalletClient(config);

  const handleStakeSeed = () => {
    const config = STAKING_CONFIG[11155111];
    const stakeAmount = Number(inputAmount);
    const allowanceResult = checkAllowanceAndApprove(
      stakeAmount,
      config.SEED_ADDRESS,
      config.STAKING_CONTRACT_ADDRESS,
      client
    );
    const is21k = stakeAmount === SEED_FOR_MINTING_NFT;
    const isPermanent = selectedDuration === INFINITE;
    const shouldMintNFT = is21k && isPermanent;
    const contract = shouldMintNFT
      ? config.FLOWER_CONTRACT_ADDRESS
      : config.STAKING_CONTRACT_ADDRESS;
    const stakeUnits = Math.floor(stakeAmount / MIN_DELEGATE_STAKE);
    const lockDuration =
      selectedDuration === INFINITE
        ? MaxUint256
        : DURATION_MAP[selectedDuration].lockDuration * ETH_BLOCKS_PER_DAY;

    return {
      config,
      stakeAmount,
      allowanceResult,
      is21k,
      isPermanent,
      shouldMintNFT,
      contract,
      stakeUnits,
      lockDuration,
    };
  };
  return handleStakeSeed();
};
