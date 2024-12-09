import { useEffect, useMemo, useState } from "react";
import { swapStore } from "../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import { evmToViemChainMap } from "@gardenfi/core";
import { useEVMWallet } from "./useEVMWallet";
import { getTokenBalance } from "../utils/getTokenBalance";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import BigNumber from "bignumber.js";

export const useBalances = () => {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const { address } = useEVMWallet();
  const { provider } = useBitcoinWallet();
  const { inputAsset } = swapStore();
  const inputTokenBalance = useMemo(
    () =>
      balances[
        `${inputAsset?.chain}_${inputAsset?.tokenAddress.toLowerCase()}`
      ],
    [balances, inputAsset]
  );

  useEffect(() => {
    if (!inputAsset) return;

    const fetchBalance = async () => {
      if (isBitcoin(inputAsset.chain)) {
        if (!provider) return;
        const balance = await provider.getBalance();
        if (balance.error || !balance.val) return;

        const bal = new BigNumber(balance.val.total)
          .dividedBy(10 ** inputAsset.decimals)
          .toNumber();
        setBalances((prev) => ({
          ...prev,
          [`${inputAsset.chain}_${inputAsset.tokenAddress}`]: bal,
        }));
      } else {
        if (!address) {
          setBalances({});
          return;
        }
        const chain = evmToViemChainMap[inputAsset.chain];
        if (!chain) return;
        const balance = await getTokenBalance(address, inputAsset);
        setBalances((prev) => ({
          ...prev,
          [`${inputAsset.chain}_${inputAsset.tokenAddress.toLowerCase()}`]:
            balance,
        }));
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [address, inputAsset, provider]);

  return { balances, inputTokenBalance };
};
