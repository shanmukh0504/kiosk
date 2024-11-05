import { useEffect, useMemo, useState } from "react";
import { swapStore } from "../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import { evmToViemChainMap } from "@gardenfi/core";
import { useEVMWallet } from "./useEVMWallet";
import { getTokenBalance } from "../utils/getTokenBalance";

export const useBalances = () => {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const { address } = useEVMWallet();
  const { inputAsset } = swapStore();
  const inputTokenBalance = useMemo(
    () =>
      balances[
        `${inputAsset?.chain}_${inputAsset?.tokenAddress.toLowerCase()}`
      ],
    [balances, inputAsset]
  );

  useEffect(() => {
    if (!inputAsset || isBitcoin(inputAsset.chain) || !address) return;
    const chain = evmToViemChainMap[inputAsset.chain];
    if (!chain) return;

    const fetchBalance = async () => {
      const balance = await getTokenBalance(address, inputAsset);
      setBalances((prev) => ({
        ...prev,
        [`${inputAsset.chain}_${inputAsset.tokenAddress.toLowerCase()}`]:
          balance,
      }));
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [address, inputAsset]);

  return { balances, inputTokenBalance };
};
