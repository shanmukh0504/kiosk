import { useReadContract } from "wagmi";
import { DISTRIBUTER_CONTRACT } from "../constants/stake";
import { distributerABI } from "../components/stake/abi/distributerClaim";

export const useFetchClaimAmount = (address: `0x${string}`) => {
    return useReadContract({
        abi: distributerABI,
        address: DISTRIBUTER_CONTRACT,
        functionName: 'getClaimedAmount',
        args: [address],
    });
};