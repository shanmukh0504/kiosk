import { useEffect, useMemo, useState } from "react";
import { swapStore } from "../store/swapStore";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { evmToViemChainMap } from "@gardenfi/core";
import { useEVMWallet } from "./useEVMWallet";
import { getTokenBalance } from "../utils/getTokenBalance";

export const useBalances = (asset?: Asset) => {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const { address } = useEVMWallet();
  const { inputAsset } = swapStore();

  const inputToken = asset || inputAsset;

  const inputTokenBalance = useMemo(
    () =>
      balances[
      `${inputToken?.chain}_${inputToken?.tokenAddress.toLowerCase()}`
      ],
    [balances, inputToken]
  );

  useEffect(() => {
    if (!address) {
      setBalances({});
      return;
    }

    if (!inputToken || isBitcoin(inputToken.chain) || !address) return;

    const chain = evmToViemChainMap[inputToken.chain];
    if (!chain) return;

    const fetchBalance = async () => {
      const balance = await getTokenBalance(address, inputToken);
      setBalances((prev) => ({
        ...prev,
        [`${inputToken.chain}_${inputToken.tokenAddress.toLowerCase()}`]: balance,
      }));
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [address, inputToken]);

  return { balances, inputTokenBalance };
};
